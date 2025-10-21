import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, AuditAction } from '../schemas/audit-log.schema';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(auditData: {
    electionId?: string;
    userId: string;
    action: AuditAction;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLog> {
    const auditLog = new this.auditLogModel(auditData);
    return auditLog.save();
  }

  async findByElection(electionId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ electionId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .populate('electionId', 'title')
      .sort({ createdAt: -1 });
  }

  async findByAction(action: AuditAction): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ action })
      .populate('userId', 'name email')
      .populate('electionId', 'title')
      .sort({ createdAt: -1 });
  }

  async findAll(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return this.auditLogModel
      .find()
      .populate('userId', 'name email')
      .populate('electionId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  async getAuditStats(): Promise<any> {
    const totalLogs = await this.auditLogModel.countDocuments();
    const actionCounts = await this.auditLogModel.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const recentActivity = await this.auditLogModel
      .find()
      .populate('userId', 'name email')
      .populate('electionId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalLogs,
      actionCounts,
      recentActivity,
    };
  }
}
