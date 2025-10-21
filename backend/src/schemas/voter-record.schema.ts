import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoterRecordDocument = VoterRecord & Document;

@Schema({ timestamps: true })
export class VoterRecord {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Election' })
  electionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  emailHash: string;

  @Prop({ required: true, default: false })
  hasVoted: boolean;

  @Prop()
  votedAt?: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const VoterRecordSchema = SchemaFactory.createForClass(VoterRecord);

// Indexes
VoterRecordSchema.index({ electionId: 1, emailHash: 1 }, { unique: true });
VoterRecordSchema.index({ electionId: 1, userId: 1 });
VoterRecordSchema.index({ electionId: 1, hasVoted: 1 });
VoterRecordSchema.index({ votedAt: -1 });
