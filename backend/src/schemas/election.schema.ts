import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ElectionDocument = Election & Document;

export enum ElectionType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ElectionStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class Election {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  creator: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: ElectionType, 
    default: ElectionType.PRIVATE 
  })
  type: ElectionType;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ 
    required: true, 
    enum: ElectionStatus, 
    default: ElectionStatus.DRAFT 
  })
  status: ElectionStatus;

  @Prop()
  allowedDomain?: string;

  @Prop()
  maxPublicVoters?: number;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: false })
  isPublicResults: boolean;

  @Prop({ default: false })
  allowAnonymousVoting: boolean;
}

export const ElectionSchema = SchemaFactory.createForClass(Election);

// Indexes
ElectionSchema.index({ creator: 1 });
ElectionSchema.index({ status: 1 });
ElectionSchema.index({ type: 1 });
ElectionSchema.index({ startAt: 1, endAt: 1 });
ElectionSchema.index({ createdAt: -1 });
