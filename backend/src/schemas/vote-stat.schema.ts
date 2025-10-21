import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoteStatDocument = VoteStat & Document;

@Schema({ timestamps: true })
export class VoteStat {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Election' })
  electionId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Candidate' })
  candidateId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  count: number;
}

export const VoteStatSchema = SchemaFactory.createForClass(VoteStat);

// Indexes
VoteStatSchema.index({ electionId: 1, candidateId: 1 }, { unique: true });
VoteStatSchema.index({ electionId: 1 });
VoteStatSchema.index({ count: -1 });
