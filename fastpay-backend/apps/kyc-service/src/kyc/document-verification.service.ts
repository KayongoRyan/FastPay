import imageSize from 'image-size';

import { KycVerificationStatus } from '@fastpay/schemas';

import type { UploadKycDocumentDto } from './dto/upload-kyc-document.dto';

const MIN_BYTES = 20_000;
const MIN_WIDTH = 640;
const MIN_HEIGHT = 400;
const APPROVAL_THRESHOLD = 0.75;
const POA_MAX_AGE_DAYS = 90;

export interface DocumentVerificationResult {
  status: KycVerificationStatus;
  confidenceScore: number;
  rejectionReason?: string;
  extractedData: Record<string, string>;
}

interface Check {
  id: string;
  passed: boolean;
  weight: number;
  critical?: boolean;
}

function detectMime(buffer: Buffer): 'jpeg' | 'png' | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'png';
  }
  return null;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameSimilarity(accountName: string, documentName: string): number {
  const left = normalizeName(accountName).split(' ').filter(Boolean);
  const right = normalizeName(documentName).split(' ').filter(Boolean);
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const matches = left.filter((token) =>
    right.some((other) => other.includes(token) || token.includes(other)),
  );

  return matches.length / Math.max(left.length, right.length);
}

function daysSince(isoDate: string): number {
  const issue = new Date(isoDate);
  if (Number.isNaN(issue.getTime())) {
    return Number.POSITIVE_INFINITY;
  }
  return (Date.now() - issue.getTime()) / (1000 * 60 * 60 * 24);
}

function evaluateChecks(checks: Check[]): DocumentVerificationResult {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const earned = checks
    .filter((check) => check.passed)
    .reduce((sum, check) => sum + check.weight, 0);
  const confidenceScore =
    totalWeight === 0 ? 0 : Math.round((earned / totalWeight) * 100) / 100;

  const failedCritical = checks.find((check) => check.critical && !check.passed);
  const failed = checks.filter((check) => !check.passed);

  if (failedCritical || confidenceScore < APPROVAL_THRESHOLD) {
    const reason =
      failedCritical?.id ??
      failed[0]?.id ??
      'verification_failed';
    return {
      status: KycVerificationStatus.REJECTED,
      confidenceScore,
      rejectionReason: humanizeReason(reason),
      extractedData: {},
    };
  }

  return {
    status: KycVerificationStatus.APPROVED,
    confidenceScore,
    extractedData: {},
  };
}

function humanizeReason(code: string): string {
  const messages: Record<string, string> = {
    valid_format: 'Upload a JPG or PNG photo of your document.',
    min_size: 'Image is too small — retake the photo in good lighting.',
    min_resolution: 'Photo is too blurry or low resolution. Move closer and refocus.',
    id_aspect: 'ID photo framing looks wrong. Capture the full card edge-to-edge.',
    id_subtype: 'Selected ID type does not match the upload.',
    name_match: 'Name on the document does not match your account name.',
    holder_name: 'Enter the name exactly as it appears on the document.',
    poa_type: 'Select a valid proof-of-address document type.',
    poa_recency: `Proof of address must be dated within the last ${POA_MAX_AGE_DAYS} days.`,
    poa_issue_date: 'Enter the issue date shown on your proof-of-address document.',
  };
  return messages[code] ?? 'Document could not be verified. Please try again.';
}

export function verifyKycDocument(
  dto: UploadKycDocumentDto,
  buffer: Buffer,
  accountFullName: string,
): DocumentVerificationResult {
  const mime = detectMime(buffer);
  let width = 0;
  let height = 0;

  try {
    const dimensions = imageSize(buffer);
    width = dimensions.width ?? 0;
    height = dimensions.height ?? 0;
  } catch {
    width = 0;
    height = 0;
  }

  const checks: Check[] = [
    {
      id: 'valid_format',
      passed: mime !== null,
      weight: 0.15,
      critical: true,
    },
    {
      id: 'min_size',
      passed: buffer.length >= MIN_BYTES,
      weight: 0.2,
      critical: true,
    },
    {
      id: 'min_resolution',
      passed: width >= MIN_WIDTH && height >= MIN_HEIGHT,
      weight: 0.25,
      critical: true,
    },
  ];

  const extractedData: Record<string, string> = {
    mime: mime ?? 'unknown',
    bytes: String(buffer.length),
    width: String(width),
    height: String(height),
  };

  if (dto.documentType === 'id_card') {
    const aspect = height > 0 ? width / height : 0;
    const aspectOk =
      dto.idSubtype === 'passport'
        ? aspect >= 0.6 && aspect <= 2.2
        : aspect >= 1.2 && aspect <= 2.1;
    checks.push(
      {
        id: 'id_aspect',
        passed: aspectOk,
        weight: 0.1,
      },
      {
        id: 'id_subtype',
        passed: Boolean(dto.idSubtype),
        weight: 0.05,
        critical: true,
      },
      {
        id: 'holder_name',
        passed: Boolean(dto.holderName?.trim()),
        weight: 0.1,
        critical: true,
      },
      {
        id: 'name_match',
        passed:
          dto.holderName !== undefined &&
          nameSimilarity(accountFullName, dto.holderName) >= 0.65,
        weight: 0.25,
        critical: true,
      },
    );

    if (dto.idSubtype) {
      extractedData.idSubtype = dto.idSubtype;
    }
    if (dto.holderName) {
      extractedData.holderName = dto.holderName;
      extractedData.nameSimilarity = String(
        nameSimilarity(accountFullName, dto.holderName),
      );
    }
  }

  if (dto.documentType === 'proof_of_address') {
    checks.push(
      {
        id: 'poa_type',
        passed: Boolean(dto.poaType),
        weight: 0.1,
        critical: true,
      },
      {
        id: 'poa_issue_date',
        passed: Boolean(dto.issueDate),
        weight: 0.1,
        critical: true,
      },
      {
        id: 'poa_recency',
        passed:
          dto.issueDate !== undefined &&
          daysSince(dto.issueDate) >= 0 &&
          daysSince(dto.issueDate) <= POA_MAX_AGE_DAYS,
        weight: 0.25,
        critical: true,
      },
      {
        id: 'holder_name',
        passed: Boolean(dto.holderName?.trim()),
        weight: 0.1,
        critical: true,
      },
      {
        id: 'name_match',
        passed:
          dto.holderName !== undefined &&
          nameSimilarity(accountFullName, dto.holderName) >= 0.65,
        weight: 0.25,
        critical: true,
      },
    );

    if (dto.poaType) {
      extractedData.poaType = dto.poaType;
    }
    if (dto.issueDate) {
      extractedData.issueDate = dto.issueDate;
      extractedData.issueAgeDays = String(Math.floor(daysSince(dto.issueDate)));
    }
    if (dto.holderName) {
      extractedData.holderName = dto.holderName;
      extractedData.nameSimilarity = String(
        nameSimilarity(accountFullName, dto.holderName),
      );
    }
  }

  const result = evaluateChecks(checks);
  return { ...result, extractedData: { ...result.extractedData, ...extractedData } };
}
