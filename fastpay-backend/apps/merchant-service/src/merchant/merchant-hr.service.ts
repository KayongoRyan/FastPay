import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  MerchantEmployee,
  MerchantEmployeeDocument,
  MerchantEmployeeRole,
  MerchantEmployeeStatus,
  MerchantPayCycle,
  MerchantPayrollEntry,
  MerchantPayrollEntryDocument,
  MerchantPayrollStatus,
} from '@fastpay/schemas';

import { MerchantOrgService } from './merchant-org.service';

@Injectable()
export class MerchantHrService {
  constructor(
    @InjectModel(MerchantEmployee.name)
    private readonly employeeModel: Model<MerchantEmployeeDocument>,
    @InjectModel(MerchantPayrollEntry.name)
    private readonly payrollModel: Model<MerchantPayrollEntryDocument>,
    private readonly orgService: MerchantOrgService,
  ) {}

  async listEmployees(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const employees = await this.employeeModel
      .find({ merchantOrgId: new Types.ObjectId(org.orgId) })
      .sort({ fullName: 1 })
      .limit(200)
      .exec();
    return employees.map((e) => this.toEmployeeView(e));
  }

  async createEmployee(
    ownerUserId: string,
    input: {
      fullName: string;
      phone?: string;
      email?: string;
      role?: MerchantEmployeeRole;
      salaryRwf?: number;
      payCycle?: MerchantPayCycle;
      hiredAt?: string;
      notes?: string;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const employee = await this.employeeModel.create({
      merchantOrgId: new Types.ObjectId(org.orgId),
      fullName: input.fullName.trim(),
      phone: input.phone?.trim(),
      email: input.email?.trim().toLowerCase(),
      role: input.role ?? MerchantEmployeeRole.STAFF,
      status: MerchantEmployeeStatus.ACTIVE,
      salaryRwf: Math.max(0, input.salaryRwf ?? 0),
      payCycle: input.payCycle ?? MerchantPayCycle.MONTHLY,
      hiredAt: input.hiredAt ? new Date(input.hiredAt) : new Date(),
      notes: input.notes?.trim(),
    });
    return this.toEmployeeView(employee);
  }

  async updateEmployee(
    ownerUserId: string,
    employeeId: string,
    patch: {
      fullName?: string;
      phone?: string;
      email?: string;
      role?: MerchantEmployeeRole;
      status?: MerchantEmployeeStatus;
      salaryRwf?: number;
      payCycle?: MerchantPayCycle;
      notes?: string;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const employee = await this.employeeModel
      .findOne({
        _id: employeeId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');

    if (patch.fullName !== undefined) employee.fullName = patch.fullName.trim();
    if (patch.phone !== undefined) employee.phone = patch.phone.trim();
    if (patch.email !== undefined) {
      employee.email = patch.email.trim().toLowerCase() || undefined;
    }
    if (patch.role !== undefined) employee.role = patch.role;
    if (patch.status !== undefined) employee.status = patch.status;
    if (patch.salaryRwf !== undefined) {
      employee.salaryRwf = Math.max(0, patch.salaryRwf);
    }
    if (patch.payCycle !== undefined) employee.payCycle = patch.payCycle;
    if (patch.notes !== undefined) employee.notes = patch.notes.trim();

    await employee.save();
    return this.toEmployeeView(employee);
  }

  async listPayroll(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const entries = await this.payrollModel
      .find({ merchantOrgId: new Types.ObjectId(org.orgId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
    return entries.map((e) => this.toPayrollView(e));
  }

  async createPayrollEntry(
    ownerUserId: string,
    input: {
      employeeId: string;
      amountRwf?: number;
      periodStart: string;
      periodEnd: string;
      note?: string;
      markPaid?: boolean;
    },
  ) {
    const org = await this.requireOrg(ownerUserId);
    const employee = await this.employeeModel
      .findOne({
        _id: input.employeeId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!employee) throw new NotFoundException('Employee not found');

    const periodStart = new Date(input.periodStart);
    const periodEnd = new Date(input.periodEnd);
    if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
      throw new BadRequestException('Invalid payroll period dates');
    }
    if (periodEnd < periodStart) {
      throw new BadRequestException('periodEnd must be on or after periodStart');
    }

    const amountRwf = Math.max(0, input.amountRwf ?? employee.salaryRwf);
    const markPaid = Boolean(input.markPaid);
    const entry = await this.payrollModel.create({
      merchantOrgId: new Types.ObjectId(org.orgId),
      employeeId: employee._id,
      employeeName: employee.fullName,
      amountRwf,
      periodStart,
      periodEnd,
      status: markPaid ? MerchantPayrollStatus.PAID : MerchantPayrollStatus.PENDING,
      paidAt: markPaid ? new Date() : undefined,
      note: input.note?.trim(),
    });

    return this.toPayrollView(entry);
  }

  async markPayrollPaid(ownerUserId: string, entryId: string) {
    const org = await this.requireOrg(ownerUserId);
    const entry = await this.payrollModel
      .findOne({
        _id: entryId,
        merchantOrgId: new Types.ObjectId(org.orgId),
      })
      .exec();
    if (!entry) throw new NotFoundException('Payroll entry not found');

    entry.status = MerchantPayrollStatus.PAID;
    entry.paidAt = new Date();
    await entry.save();
    return this.toPayrollView(entry);
  }

  async hrSummary(ownerUserId: string) {
    const org = await this.requireOrg(ownerUserId);
    const orgId = new Types.ObjectId(org.orgId);
    const active = await this.employeeModel.countDocuments({
      merchantOrgId: orgId,
      status: MerchantEmployeeStatus.ACTIVE,
    });
    const monthlyPayroll = await this.employeeModel
      .aggregate<{ total: number }>([
        {
          $match: {
            merchantOrgId: orgId,
            status: MerchantEmployeeStatus.ACTIVE,
          },
        },
        { $group: { _id: null, total: { $sum: '$salaryRwf' } } },
      ])
      .exec();
    const pending = await this.payrollModel.countDocuments({
      merchantOrgId: orgId,
      status: MerchantPayrollStatus.PENDING,
    });

    return {
      activeEmployees: active,
      monthlySalaryCommitRwf: monthlyPayroll[0]?.total ?? 0,
      pendingPayrollEntries: pending,
    };
  }

  private async requireOrg(ownerUserId: string) {
    const org = await this.orgService.getOrgForOwner(ownerUserId);
    if (!org) throw new NotFoundException('Merchant organization not found');
    return org;
  }

  private toEmployeeView(employee: MerchantEmployeeDocument) {
    return {
      id: employee._id.toString(),
      fullName: employee.fullName,
      phone: employee.phone,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      salaryRwf: employee.salaryRwf,
      payCycle: employee.payCycle,
      hiredAt: employee.hiredAt?.toISOString(),
      notes: employee.notes,
      createdAt: employee.createdAt?.toISOString(),
    };
  }

  private toPayrollView(entry: MerchantPayrollEntryDocument) {
    return {
      id: entry._id.toString(),
      employeeId: entry.employeeId.toString(),
      employeeName: entry.employeeName,
      amountRwf: entry.amountRwf,
      periodStart: entry.periodStart.toISOString(),
      periodEnd: entry.periodEnd.toISOString(),
      status: entry.status,
      paidAt: entry.paidAt?.toISOString(),
      note: entry.note,
      createdAt: entry.createdAt?.toISOString(),
    };
  }
}
