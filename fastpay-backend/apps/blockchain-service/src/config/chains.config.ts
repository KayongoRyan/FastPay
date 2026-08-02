import { registerAs } from '@nestjs/config';

export type EvmChainId = 'ethereum' | 'polygon' | 'base';
export type SupportedChain = EvmChainId | 'solana';

export const EVM_CHAINS: EvmChainId[] = ['ethereum', 'polygon', 'base'];
export const SUPPORTED_CHAINS: SupportedChain[] = [
  'ethereum',
  'polygon',
  'solana',
  'base',
];

const DEFAULT_RPC: Record<SupportedChain, string> = {
  ethereum: 'https://ethereum-sepolia-rpc.publicnode.com',
  polygon: 'https://polygon-amoy-bor-rpc.publicnode.com',
  base: 'https://base-sepolia-rpc.publicnode.com',
  solana: 'https://api.devnet.solana.com',
};

export default registerAs('chains', () => ({
  rpc: {
    ethereum: process.env.ETH_RPC_URL ?? DEFAULT_RPC.ethereum,
    polygon: process.env.POLYGON_RPC_URL ?? DEFAULT_RPC.polygon,
    base: process.env.BASE_RPC_URL ?? DEFAULT_RPC.base,
    solana: process.env.SOLANA_RPC_URL ?? DEFAULT_RPC.solana,
  } as Record<SupportedChain, string>,
  chainIds: {
    ethereum: Number(process.env.ETH_CHAIN_ID ?? 11155111),
    polygon: Number(process.env.POLYGON_CHAIN_ID ?? 80002),
    base: Number(process.env.BASE_CHAIN_ID ?? 84532),
  } as Record<EvmChainId, number>,
  eventPollMs: Number(process.env.BLOCKCHAIN_EVENT_POLL_MS ?? 12_000),
  maxRpcRetries: Number(process.env.BLOCKCHAIN_RPC_MAX_RETRIES ?? 3),
}));
