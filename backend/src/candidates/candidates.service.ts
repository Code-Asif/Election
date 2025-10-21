import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from '../schemas/candidate.schema';
import { VoteStat, VoteStatDocument } from '../schemas/vote-stat.schema';
import { Election, ElectionDocument, ElectionStatus } from '../schemas/election.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuditAction } from '../schemas/audit-log.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
    @InjectModel(VoteStat.name) private voteStatModel: Model<VoteStatDocument>,
    @InjectModel(Election.name) private electionModel: Model<ElectionDocument>,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(createCandidateDto: CreateCandidateDto, userId: string): Promise<Candidate> {
    const election = await this.electionModel.findById(createCandidateDto.electionId);
    
    if (!election) {
      throw new NotFoundException('Election not found');
    }

    // Handle both ObjectId and populated creator
    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the election creator can add candidates');
    }

    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Cannot add candidates to a non-draft election');
    }

    const candidate = new this.candidateModel(createCandidateDto);
    await candidate.save();

    // Create initial vote stat
    const voteStat = new this.voteStatModel({
      electionId: createCandidateDto.electionId,
      candidateId: candidate._id,
      count: 0,
    });
    await voteStat.save();

    // Log the creation
    await this.auditLogsService.create({
      electionId: createCandidateDto.electionId.toString(),
      userId,
      action: AuditAction.CANDIDATE_ADDED,
      metadata: { candidateName: candidate.name },
    });

    return candidate;
  }

  async findAll(electionId: string): Promise<Candidate[]> {
    return this.candidateModel.find({ electionId, isActive: true }).sort({ createdAt: 1 });
  }

  async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateModel.findById(id);
    
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async update(id: string, updateCandidateDto: UpdateCandidateDto, userId: string): Promise<Candidate> {
    const candidate = await this.candidateModel.findById(id);
    
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const election = await this.electionModel.findById(candidate.electionId);
    
    // Handle both ObjectId and populated creator
    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the election creator can update candidates');
    }

    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Cannot update candidates in a non-draft election');
    }

    const updatedCandidate = await this.candidateModel.findByIdAndUpdate(
      id,
      updateCandidateDto,
      { new: true }
    );

    // Log the update
    await this.auditLogsService.create({
      electionId: candidate.electionId.toString(),
      userId,
      action: AuditAction.CANDIDATE_UPDATED,
      metadata: { candidateName: updatedCandidate.name },
    });

    return updatedCandidate;
  }

  async remove(id: string, userId: string): Promise<void> {
    const candidate = await this.candidateModel.findById(id);
    
    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    const election = await this.electionModel.findById(candidate.electionId);
    
    // Handle both ObjectId and populated creator
    const creatorId = election.creator._id ? election.creator._id.toString() : election.creator.toString();
    if (creatorId !== userId.toString()) {
      throw new ForbiddenException('Only the election creator can remove candidates');
    }

    if (election.status !== ElectionStatus.DRAFT) {
      throw new BadRequestException('Cannot remove candidates from a non-draft election');
    }

    // Soft delete
    candidate.isActive = false;
    await candidate.save();

    // Log the removal
    await this.auditLogsService.create({
      electionId: candidate.electionId.toString(),
      userId,
      action: AuditAction.CANDIDATE_REMOVED,
      metadata: { candidateName: candidate.name },
    });
  }

  async getCandidateStats(electionId: string): Promise<any[]> {
    const candidates = await this.candidateModel.find({ electionId, isActive: true });
    const voteStats = await this.voteStatModel.find({ electionId });
    
    return candidates.map(candidate => {
      const voteStat = voteStats.find(stat => 
        stat.candidateId.toString() === candidate._id.toString()
      );
      
      return {
        candidate,
        voteCount: voteStat?.count || 0,
      };
    }).sort((a, b) => b.voteCount - a.voteCount);
  }
}
