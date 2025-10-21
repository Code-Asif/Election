import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { Election, ElectionSchema } from '../schemas/election.schema';
import { Candidate, CandidateSchema } from '../schemas/candidate.schema';
import { VoteStat, VoteStatSchema } from '../schemas/vote-stat.schema';
import { VoterRecord, VoterRecordSchema } from '../schemas/voter-record.schema';
import { AuditLog, AuditLogSchema } from '../schemas/audit-log.schema';
import { CandidatesModule } from '../candidates/candidates.module';
import { VotesModule } from '../votes/votes.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Election.name, schema: ElectionSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: VoteStat.name, schema: VoteStatSchema },
      { name: VoterRecord.name, schema: VoterRecordSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    CandidatesModule,
    VotesModule,
    AuditLogsModule,
  ],
  providers: [ElectionsService],
  controllers: [ElectionsController],
  exports: [ElectionsService],
})
export class ElectionsModule {}
