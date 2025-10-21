import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate, CandidateSchema } from '../schemas/candidate.schema';
import { VoteStat, VoteStatSchema } from '../schemas/vote-stat.schema';
import { Election, ElectionSchema } from '../schemas/election.schema';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: VoteStat.name, schema: VoteStatSchema },
      { name: Election.name, schema: ElectionSchema },
    ]),
    AuditLogsModule,
  ],
  providers: [CandidatesService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
