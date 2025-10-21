import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { VoteStat, VoteStatSchema } from '../schemas/vote-stat.schema';
import { VoterRecord, VoterRecordSchema } from '../schemas/voter-record.schema';
import { Candidate, CandidateSchema } from '../schemas/candidate.schema';
import { Election, ElectionSchema } from '../schemas/election.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VoteStat.name, schema: VoteStatSchema },
      { name: VoterRecord.name, schema: VoterRecordSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Election.name, schema: ElectionSchema },
    ]),
    AuditLogsModule,
  ],
  providers: [VotesService],
  controllers: [VotesController],
  exports: [VotesService],
})
export class VotesModule {}
