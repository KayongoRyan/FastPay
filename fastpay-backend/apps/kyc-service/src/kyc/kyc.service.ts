import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  KycDocument,
  KycDocumentDocument,
  KycVerificationStatus,
  KycStatus,
  User,
  UserDocument,
} from '@fastpay/schemas';

import { UploadKycDocumentDto } from './dto/upload-kyc-document.dto';
import { verifyKycDocument } from './document-verification.service';

@Injectable()
export class KycService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'kyc');

  constructor(
    @InjectModel(KycDocument.name)
    private readonly kycDocumentModel: Model<KycDocumentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async uploadDocument(userId: string, dto: UploadKycDocumentDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await mkdir(this.uploadDir, { recursive: true });

    const fileName = `${userId}-${dto.documentType}-${Date.now()}-${dto.fileName}`;
    const filePath = join(this.uploadDir, fileName);
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    await writeFile(filePath, buffer);

    const verification = verifyKycDocument(dto, buffer, user.fullName);
    const verifiedAt =
      verification.status === KycVerificationStatus.APPROVED
        ? new Date()
        : undefined;

    const document = await this.kycDocumentModel.create({
      userId: new Types.ObjectId(userId),
      documentType: dto.documentType,
      idSubtype: dto.idSubtype,
      poaType: dto.poaType,
      s3Key: filePath,
      verificationStatus: verification.status,
      confidenceScore: verification.confidenceScore,
      rejectionReason: verification.rejectionReason,
      extractedData: verification.extractedData,
      verifiedAt,
    });

    await this.syncUserKycStatus(userId);

    return {
      documentId: document._id.toString(),
      verificationStatus: document.verificationStatus,
      confidenceScore: document.confidenceScore,
      rejectionReason: document.rejectionReason,
    };
  }

  async getStatus(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.syncUserKycStatus(userId);
    const refreshed = await this.userModel.findById(userId).exec();
    if (!refreshed) {
      throw new NotFoundException('User not found');
    }

    const documents = await this.kycDocumentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    return {
      kycStatus: refreshed.kycStatus,
      kycLevel: refreshed.kycLevel,
      documents: documents.map((doc) => ({
        documentType: doc.documentType,
        idSubtype: doc.idSubtype,
        poaType: doc.poaType,
        verificationStatus: doc.verificationStatus,
        confidenceScore: doc.confidenceScore,
        rejectionReason: doc.rejectionReason,
        uploadedAt:
          (doc as KycDocument & { createdAt?: Date }).createdAt?.toISOString() ??
          new Date().toISOString(),
      })),
    };
  }

  private async syncUserKycStatus(userId: string): Promise<void> {
    const documents = await this.kycDocumentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    const latestId = documents.find((doc) => doc.documentType === 'id_card');
    const latestPoa = documents.find(
      (doc) => doc.documentType === 'proof_of_address',
    );

    const idApproved =
      latestId?.verificationStatus === KycVerificationStatus.APPROVED;
    const poaApproved =
      latestPoa?.verificationStatus === KycVerificationStatus.APPROVED;

    let kycStatus = KycStatus.PENDING;
    let kycLevel = 0;

    if (idApproved && poaApproved) {
      kycStatus = KycStatus.VERIFIED;
      kycLevel = 1;
    } else if (
      latestId?.verificationStatus === KycVerificationStatus.REJECTED ||
      latestPoa?.verificationStatus === KycVerificationStatus.REJECTED
    ) {
      kycStatus = KycStatus.REJECTED;
    }

    await this.userModel.findByIdAndUpdate(userId, { kycStatus, kycLevel });
  }
}
