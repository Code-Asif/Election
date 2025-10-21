import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoteStat, VoteStatDocument } from '../schemas/vote-stat.schema';
import { VoterRecord, VoterRecordDocument } from '../schemas/voter-record.schema';
import { Candidate, CandidateDocument } from '../schemas/candidate.schema';
import { Election, ElectionDocument, ElectionStatus } from '../schemas/election.schema';
import { CastVoteDto } from './dto/cast-vote.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../schemas/audit-log.schema';
import * as crypto from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(VoteStat.name) private voteStatModel: Model<VoteStatDocument>,
    @InjectModel(VoterRecord.name) private voterRecordModel: Model<VoterRecordDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(Election.name) private electionModel: Model<ElectionDocument>,
    private auditLogsService: AuditLogsService,
  ) {}

  async castVote(castVoteDto: CastVoteDto, userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<any> {
    const { electionId, candidateId } = castVoteDto;

    console.log('=== CAST VOTE DEBUG ===');
    console.log('Election ID:', electionId, 'Type:', typeof electionId);
    console.log('Candidate ID:', candidateId, 'Type:', typeof candidateId);

    // Verify election exists and is running
    const election = await this.electionModel.findById(electionId);
    if (!election) {
      throw new NotFoundException('Election not found');
    }
    console.log('Found election:', election._id.toString());

    if (election.status !== ElectionStatus.RUNNING) {
      throw new BadRequestException('Election is not currently running');
    }

    // Check if election is still within time bounds
    const now = new Date();
    if (now < election.startAt || now > election.endAt) {
      throw new BadRequestException('Election is not currently accepting votes');
    }

    // Verify candidate exists and belongs to this election
    const candidate = await this.candidateModel.findOne({ 
      _id: new Types.ObjectId(candidateId), 
      $or: [
        { electionId: new Types.ObjectId(electionId) },
        { electionId: (electionId as unknown) as any },
      ],
      isActive: true 
    });
    if (!candidate) {
      throw new NotFoundException('Candidate not found or inactive');
    }

    // Check eligibility
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    
    // Check if user has already voted (support legacy string/ObjectId electionId)
    const existingVoterRecord = await this.voterRecordModel.findOne({
      emailHash,
      $or: [
        { electionId: new Types.ObjectId(electionId) },
        { electionId: (electionId as unknown) as any },
      ],
    });

    if (existingVoterRecord && existingVoterRecord.hasVoted) {
      throw new BadRequestException('You have already voted in this election');
    }

    // Check domain restriction if applicable
    if (election.allowedDomain) {
      const emailDomain = email.split('@')[1];
      if (emailDomain !== election.allowedDomain) {
        throw new ForbiddenException('Your email domain is not allowed for this election');
      }
    }

    // Perform atomic operations without Mongo transactions for broader compatibility
    // 1) Atomic, idempotent voter record upsert: only match if not already voted
    let changed = false;
    try {
      const res = await this.voterRecordModel.updateOne(
        { electionId: new Types.ObjectId(electionId), emailHash, hasVoted: { $ne: true } },
        {
          $set: {
            hasVoted: true,
            votedAt: new Date(),
            ipAddress,
            userAgent,
          },
          $setOnInsert: {
            userId: userId || null,
            electionId: new Types.ObjectId(electionId),
            emailHash,
          },
        },
        { upsert: true }
      );
      // If we inserted a new record or modified an existing one from not-voted -> voted
      changed = (res.upsertedCount === 1) || (res.modifiedCount === 1);
    } catch (err: any) {
      // If unique index collides due to concurrent upsert, user has already voted
      if (err?.code === 11000) {
        throw new BadRequestException('You have already voted in this election');
      }
      throw err;
    }

    if (!changed) {
      // No change means the user was already marked as voted
      throw new BadRequestException('You have already voted in this election');
    }

    // 2) Only now increment vote counts (first successful change wins)
    const voteStatResult = await this.voteStatModel.findOneAndUpdate(
      { electionId: new Types.ObjectId(electionId), candidateId: new Types.ObjectId(candidateId) },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    console.log('Vote stat after increment (no-tx):', {
      electionId: voteStatResult.electionId.toString(),
      candidateId: voteStatResult.candidateId.toString(),
      count: voteStatResult.count,
    });

    await this.candidateModel.findByIdAndUpdate(
      new Types.ObjectId(candidateId),
      { $inc: { voteCount: 1 } }
    );

    console.log('=== CAST VOTE COMPLETE (no-tx) ===');

    // Log the vote (without revealing the candidate choice for anonymity)
    await this.auditLogsService.create({
      electionId,
      userId: userId || null,
      action: AuditAction.VOTE_CAST,
      metadata: { 
        candidateId,
        timestamp: new Date(),
      },
      ipAddress,
      userAgent,
    });

    return { 
      success: true, 
      message: 'Vote cast successfully',
      electionId,
      votedAt: new Date()
    };
  }

  async getVoteResults(electionId: string): Promise<any> {
    const election = await this.electionModel.findById(electionId);
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    console.log('=== VOTE RESULTS DEBUG ===');
    console.log('Election ID:', electionId);

    const candidates = await this.candidateModel.find({ 
      $or: [
        { electionId: new Types.ObjectId(electionId) },
        { electionId: (electionId as unknown) as any },
      ]
    });
    console.log('Found candidates:', candidates.length);
    console.log('Candidates:', candidates.map(c => ({ id: c._id.toString(), name: c.name, electionId: c.electionId?.toString() })));

    const voteStats = await this.voteStatModel.find({ 
      $or: [
        { electionId: new Types.ObjectId(electionId) },
        { electionId: (electionId as unknown) as any },
      ]
    });
    console.log('Found vote stats:', voteStats.length);
    console.log('Vote Stats:', voteStats.map(vs => ({ 
      electionId: vs.electionId.toString(), 
      candidateId: vs.candidateId.toString(), 
      count: vs.count 
    })));

    // Also try finding all vote stats to see if they exist with different electionId format
    const allVoteStats = await this.voteStatModel.find({});
    console.log('ALL Vote Stats in DB:', allVoteStats.map(vs => ({ 
      electionId: vs.electionId.toString(), 
      candidateId: vs.candidateId.toString(), 
      count: vs.count 
    })));

    const totalVotes = await this.voterRecordModel.countDocuments({ 
      $and: [
        { hasVoted: true },
        { $or: [
          { electionId: new Types.ObjectId(electionId) },
          { electionId: (electionId as unknown) as any },
        ]}
      ]
    });
    console.log('Total votes from voter records:', totalVotes);

    const candidateMap = new Map<string, any>();
    for (const c of candidates) {
      candidateMap.set(c._id.toString(), c);
    }

    // Start with stats-driven results to avoid missing rows when candidate doc is gone
    const resultMap = new Map<string, { candidate: any; voteCount: number; percentage: number }>();
    for (const stat of voteStats) {
      const cid = stat.candidateId.toString();
      const c = candidateMap.get(cid);
      const voteCount = stat.count || 0;
      const percentage = totalVotes > 0 ? Number(((voteCount) / totalVotes * 100).toFixed(2)) : 0;
      resultMap.set(cid, {
        candidate: c
          ? { id: c._id, name: c.name, photoUrl: c.photoUrl, bio: c.bio }
          : { id: stat.candidateId, name: 'Unknown candidate', photoUrl: undefined, bio: undefined },
        voteCount,
        percentage,
      });
    }

    // Include candidates with zero votes
    for (const c of candidates) {
      const cid = c._id.toString();
      if (!resultMap.has(cid)) {
        resultMap.set(cid, {
          candidate: { id: c._id, name: c.name, photoUrl: c.photoUrl, bio: c.bio },
          voteCount: 0,
          percentage: 0,
        });
      }
    }

    const results = Array.from(resultMap.values()).sort((a, b) => b.voteCount - a.voteCount);

    console.log('=== END DEBUG ===');

    return {
      election: {
        id: election._id,
        title: election.title,
        status: election.status,
        totalVotes,
        startAt: election.startAt,
        endAt: election.endAt,
      },
      results,
    };
  }

  async hasUserVoted(electionId: string, email: string): Promise<boolean> {
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const voterRecord = await this.voterRecordModel.findOne({
      electionId: new Types.ObjectId(electionId),
      emailHash,
      hasVoted: true,
    });
    return !!voterRecord;
  }

  async getVoterRecord(electionId: string, email: string): Promise<VoterRecord | null> {
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    return this.voterRecordModel.findOne({
      electionId: new Types.ObjectId(electionId),
      emailHash,
    });
  }
}
