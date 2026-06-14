import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Asset,
  FeeBumpTransaction,
  Horizon,
  Keypair,
  Memo,
  Operation,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

import {
  BuiltTransaction,
  StellarAccountKeys,
  StellarBalance,
  SubmittedTransaction,
} from './interfaces/stellar.types';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly horizonServer: Horizon.Server;
  private readonly networkPassphrase: string;
  private readonly friendbotUrl: string;

  constructor(private readonly configService: ConfigService) {
    const horizonUrl = this.configService.getOrThrow<string>(
      'stellar.horizonUrl',
    );
    this.networkPassphrase = this.configService.getOrThrow<string>(
      'stellar.networkPassphrase',
    );
    this.friendbotUrl = this.configService.getOrThrow<string>(
      'stellar.friendbotUrl',
    );
    this.horizonServer = new Horizon.Server(horizonUrl);
  }

  async createAccount(fundWithFriendbot = true): Promise<StellarAccountKeys> {
    const keypair = Keypair.random();

    if (fundWithFriendbot) {
      await this.fundWithFriendbot(keypair.publicKey());
    }

    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  async fundWithFriendbot(publicKey: string): Promise<void> {
    const url = `${this.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Friendbot failed for ${publicKey}: ${body}`);
      throw new InternalServerErrorException(
        `Friendbot funding failed: ${response.status}`,
      );
    }
  }

  async buildPaymentTransaction(params: {
    sourceSecret: string;
    destination: string;
    amount: string;
    assetCode?: string;
    assetIssuer?: string;
    memo?: string;
  }): Promise<BuiltTransaction> {
    const sourceKeypair = Keypair.fromSecret(params.sourceSecret);
    const account = await this.loadAccount(sourceKeypair.publicKey());
    const fee = await this.horizonServer.fetchBaseFee();

    const asset =
      params.assetCode && params.assetIssuer
        ? new Asset(params.assetCode, params.assetIssuer)
        : Asset.native();

    let builder = new TransactionBuilder(account, {
      fee: fee.toString(),
      networkPassphrase: this.networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination: params.destination,
        asset,
        amount: params.amount,
      }),
    );

    if (params.memo) {
      builder = builder.addMemo(Memo.text(params.memo));
    }

    const transaction = builder.setTimeout(180).build();
    transaction.sign(sourceKeypair);

    return {
      xdr: transaction.toEnvelope().toXDR('base64'),
      hash: transaction.hash().toString('hex'),
    };
  }

  async submitTransaction(xdr: string): Promise<SubmittedTransaction> {
    try {
      const transaction = new Transaction(xdr, this.networkPassphrase);
      const response = await this.horizonServer.submitTransaction(transaction);

      return {
        hash: response.hash,
        ledger: response.ledger,
        envelopeXdr: response.envelope_xdr,
        resultXdr: response.result_xdr,
      };
    } catch (error) {
      this.handleHorizonError(error, 'submit transaction');
    }
  }

  async getBalance(publicKey: string): Promise<StellarBalance[]> {
    const account = await this.loadAccount(publicKey);

    return account.balances.map((entry) => ({
      balance: entry.balance,
      assetType: entry.asset_type,
      assetCode: 'asset_code' in entry ? entry.asset_code : undefined,
      assetIssuer: 'asset_issuer' in entry ? entry.asset_issuer : undefined,
    }));
  }

  get server(): Horizon.Server {
    return this.horizonServer;
  }

  get network(): string {
    return this.networkPassphrase;
  }

  async verifySignedXdr(xdr: string): Promise<boolean> {
    try {
      const transaction = this.parseTransaction(xdr);

      if (transaction.signatures.length === 0) {
        return false;
      }

      const sourceAccount = transaction.source;
      const account = await this.horizonServer.loadAccount(sourceAccount);
      const txHash = transaction.hash();

      return transaction.signatures.some((signature) => {
        const hint = signature.hint();
        const signatureBytes = signature.signature();

        return account.signers.some((signer) => {
          try {
            const keypair = Keypair.fromPublicKey(signer.key);
            if (!keypair.signatureHint().equals(hint)) {
              return false;
            }

            return keypair.verify(txHash, signatureBytes);
          } catch {
            return false;
          }
        });
      });
    } catch (error) {
      this.logger.warn(
        `XDR verification failed: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }

  async submit(xdr: string): Promise<string> {
    const result = await this.submitTransaction(xdr);
    return result.hash;
  }

  async getAccountSequence(publicKey: string): Promise<string> {
    const account = await this.loadAccount(publicKey);
    return account.sequence;
  }

  parseTransaction(xdr: string): Transaction {
    const transaction = TransactionBuilder.fromXDR(xdr, this.networkPassphrase);

    if (transaction instanceof FeeBumpTransaction) {
      throw new BadRequestException('Fee bump transactions are not supported');
    }

    return transaction;
  }

  private async loadAccount(
    publicKey: string,
  ): Promise<Horizon.AccountResponse> {
    try {
      return await this.horizonServer.loadAccount(publicKey);
    } catch (error) {
      this.handleHorizonError(error, `load account ${publicKey}`);
    }
  }

  private handleHorizonError(error: unknown, context: string): never {
    if (this.isHorizonError(error)) {
      const detail = error.response?.data?.extras?.result_codes
        ? JSON.stringify(error.response.data.extras.result_codes)
        : error.response?.data?.detail;

      throw new BadRequestException(
        `Stellar ${context} failed: ${detail ?? error.message}`,
      );
    }

    if (error instanceof Error) {
      throw new BadRequestException(`Stellar ${context} failed: ${error.message}`);
    }

    throw new InternalServerErrorException(`Stellar ${context} failed`);
  }

  private isHorizonError(
    error: unknown,
  ): error is Error & {
    response?: {
      data?: {
        detail?: string;
        extras?: { result_codes?: unknown };
      };
    };
  } {
    return error instanceof Error && 'response' in error;
  }
}
