import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditAction {
  ELECTION_CREATED = 'election_created',
  ELECTION_UPDATED = 'election_updated',
  ELECTION_DELETED = 'election_deleted',
  ELECTION_STARTED = 'election_started',
  ELECTION_CLOSED = 'election_closed',
  CANDIDATE_ADDED = 'candidate_added',
  CANDIDATE_UPDATED = 'candidate_updated',
  CANDIDATE_REMOVED = 'candidate_removed',
  VOTE_CAST = 'vote_cast',
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  ADMIN_ACTION = 'admin_action',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Election' })
  electionId?: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes
AuditLogSchema.index({ electionId: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ electionId: 1, createdAt: -1 });
