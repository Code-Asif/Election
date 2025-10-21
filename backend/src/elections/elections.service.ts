import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Election, ElectionDocument, ElectionStatus } from '../schemas/election.schema';
import { Candidate, CandidateDocument } from '../schemas/candidate.schema';
import { VoteStat, VoteStatDocument } from '../schemas/vote-stat.schema';
import { VoterRecord, VoterRecordDocument } from '../schemas/voter-record.schema';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../schemas/audit-log.schema';
import * as crypto from 'crypto';

@Injectable()
export class ElectionsService {
  constructor(
    @InjectModel(Election.name) private electionModel: Model<ElectionDocument>,
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(VoteStat.name) private voteStatModel: Model<VoteStatDocument>,
    @InjectModel(VoterRecord.name) private voterRecordModel: Model<VoterRecordDocument>,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(createElectionDto: CreateElectionDto, userId: string): Promise<Election> {
    const slug = this.generateSlug();
    
    const election = new this.electionModel({
      ...createElectionDto,
      creator: userId,
      slug,
    });

    await election.save();

    // Log the creation
    await this.auditLogsService.create({
      electionId: election._id.toString(),
      userId,
      action: AuditAction.ELECTION_CREATED,
      metadata: { title: election.title, type: election.type },
    });

    return election;
  }

  async findAll(userId: string, userRole: string): Promise<Election[]> {
    if (userRole === 'admin') {
      return this.electionModel.find().populate('creator', 'name email').sort({ createdAt: -1 });
    }
    
    return this.electionModel.find({ 
      $or: [
        { creator: userId },
        { status: ElectionStatus.RUNNING },
        { status: ElectionStatus.CLOSED }
      ]
    }).populate('creator', 'name email').sort({ createdAt: -1 });
  }

  async findOne(id: string, userId: string | null, userRole: string | null): Promise<Election> {
    const election = await this.electionModel.findById(id).populate('creator', 'name email');
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Check if user has access to this election
    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (userId && userRole !== 'admin' && creatorId !== userId.toString()) {
      if (election.status === ElectionStatus.DRAFT) {
        throw new ForbiddenException('Access denied to draft election');
      }
    } else if (!userId && election.status === ElectionStatus.DRAFT) {
      throw new ForbiddenException('Access denied to draft election');
    }

    return election;
  }

  async findBySlug(slug: string): Promise<Election> {
    const election = await this.electionModel.findOne({ slug }).populate('creator', 'name email');
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    return election;
  }

  async update(id: string, updateElectionDto: UpdateElectionDto, userId: string): Promise<Election> {
    const election = await this.electionModel.findById(id);
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the creator can update this election');
    }

    if (election.status === ElectionStatus.RUNNING) {
      throw new BadRequestException('Cannot update a running election');
    }

    const updatedElection = await this.electionModel.findByIdAndUpdate(
      id,
      updateElectionDto,
      { new: true }
    );

    // Log the update
    await this.auditLogsService.create({
      electionId: election._id.toString(),
      userId,
      action: AuditAction.ELECTION_UPDATED,
      metadata: { changes: updateElectionDto },
    });

    return updatedElection;
  }

  async remove(id: string, userId: string): Promise<void> {
    const election = await this.electionModel.findById(id);
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the creator can delete this election');
    }

    if (election.status === ElectionStatus.RUNNING) {
      throw new BadRequestException('Cannot delete a running election');
    }

    // Delete related data
    await this.candidateModel.deleteMany({ electionId: id });
    await this.voteStatModel.deleteMany({ electionId: id });
    await this.voterRecordModel.deleteMany({ electionId: id });
    await this.electionModel.findByIdAndDelete(id);

    // Log the deletion
    await this.auditLogsService.create({
      electionId: election._id.toString(),
      userId,
      action: AuditAction.ELECTION_DELETED,
      metadata: { title: election.title },
    });
  }

  async startElection(id: string, userId: string): Promise<Election> {
    const election = await this.electionModel.findById(id);
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the creator can start this election');
    }

    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Only draft elections can be started');
    }

    // Check if election has candidates
    const candidateCount = await this.candidateModel.countDocuments({ 
      electionId: id, 
      isActive: true 
    });
    
    if (candidateCount < 2) {
      throw new BadRequestException('Election must have at least 2 candidates before starting');
    }

    const now = new Date();
    if (election.startAt > now) {
      throw new BadRequestException('Cannot start election before scheduled start time');
    }

    election.status = ElectionStatus.RUNNING;
    await election.save();

    // Log the start
    await this.auditLogsService.create({
      electionId: election._id.toString(),
      userId,
      action: AuditAction.ELECTION_STARTED,
      metadata: { startAt: election.startAt },
    });

    return election;
  }

  async closeElection(id: string, userId: string): Promise<Election> {
    const election = await this.electionModel.findById(id);
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the creator can close this election');
    }

    if (election.status !== ElectionStatus.RUNNING) {
      throw new BadRequestException('Only running elections can be closed');
    }

    election.status = ElectionStatus.CLOSED;
    await election.save();

    // Log the close
    await this.auditLogsService.create({
      electionId: election._id.toString(),
      userId,
      action: AuditAction.ELECTION_CLOSED,
      metadata: { endAt: election.endAt },
    });

    return election;
  }

  async findPublicElections(): Promise<Election[]> {
    return this.electionModel.find({
      $or: [
        { status: ElectionStatus.RUNNING },
        { status: ElectionStatus.CLOSED }
      ]
    }).populate('creator', 'name email').sort({ createdAt: -1 });
  }

  async getElectionStats(id: string): Promise<any> {
    const election = await this.electionModel.findById(id);
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    const candidates = await this.candidateModel.find({ electionId: id });
    const voteStats = await this.voteStatModel.find({ electionId: id });
    const totalVotes = await this.voterRecordModel.countDocuments({ 
      electionId: id, 
      hasVoted: true 
    });

    return {
      election,
      candidates,
      voteStats,
      totalVotes,
      totalCandidates: candidates.length,
    };
  }

  async checkEligibility(electionId: string, email: string): Promise<boolean> {
    const election = await this.electionModel.findById(electionId);
    if (!election) {
      return false;
    }

    // Check domain restriction
    if (election.allowedDomain) {
      const emailDomain = email.split('@')[1];
      if (emailDomain !== election.allowedDomain) {
        return false;
      }
    }

    // Check if user has already voted
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const voterRecord = await this.voterRecordModel.findOne({
      electionId,
      emailHash,
      hasVoted: true,
    });

    return !voterRecord;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkElectionStatus(): Promise<void> {
    const now = new Date();
    
    // Start elections that are due
    await this.electionModel.updateMany(
      {
        status: ElectionStatus.DRAFT,
        startAt: { $lte: now },
      },
      { status: ElectionStatus.RUNNING }
    );

    // Close elections that are due
    await this.electionModel.updateMany(
      {
        status: ElectionStatus.RUNNING,
        endAt: { $lte: now },
      },
      { status: ElectionStatus.CLOSED }
    );
  }

  private generateSlug(): string {
    const randomString = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now().toString(36);
    return `${timestamp}-${randomString}`;
  }
}
