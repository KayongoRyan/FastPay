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
    await mkdir(this.uploadDir, { recursive: true });

    const fileName = `${userId}-${dto.documentType}-${Date.now()}-${dto.fileName}`;
    const filePath = join(this.uploadDir, fileName);
    const buffer = Buffer.from(dto.contentBase64, 'base64');
    await writeFile(filePath, buffer);

    const document = await this.kycDocumentModel.create({
      userId: new Types.ObjectId(userId),
      documentType: dto.documentType,
      s3Key: filePath,
      verificationStatus: KycVerificationStatus.PENDING,
    });

    await this.userModel.findByIdAndUpdate(userId, {
      kycStatus: KycStatus.PENDING,
    });

    return {
      documentId: document._id.toString(),
      verificationStatus: document.verificationStatus,
    };
  }

  async getStatus(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const documents = await this.kycDocumentModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();

    const hasId = documents.some((doc) => doc.documentType === 'id_card');
    const hasPoa = documents.some(
      (doc) => doc.documentType === 'proof_of_address',
    );

    if (hasId && hasPoa && user.kycStatus !== KycStatus.VERIFIED) {
      await this.userModel.findByIdAndUpdate(userId, {
        kycStatus: KycStatus.VERIFIED,
        kycLevel: 1,
      });
      user.kycStatus = KycStatus.VERIFIED;
      user.kycLevel = 1;
    }

    return {
      kycStatus: user.kycStatus,
      kycLevel: user.kycLevel,
      documents: documents.map((doc) => ({
        documentType: doc.documentType,
        verificationStatus: doc.verificationStatus,
        uploadedAt:
          (doc as KycDocument & { createdAt?: Date }).createdAt?.toISOString() ??
          new Date().toISOString(),
      })),
    };
  }
}
