import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Election' })
  electionId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  bio?: string;

  @Prop()
  manifesto?: string;

  @Prop({ default: 0 })
  voteCount: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);

// Indexes
CandidateSchema.index({ electionId: 1 });
CandidateSchema.index({ electionId: 1, isActive: 1 });
CandidateSchema.index({ voteCount: -1 });
