import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createCandidateDto: CreateCandidateDto, @Request() req) {
    return this.candidatesService.create(createCandidateDto, req.user._id);
  }

  @Get('election/:electionId')
  @ApiOperation({ summary: 'Get candidates for an election' })
  @ApiResponse({ status: 200, description: 'Candidates retrieved successfully' })
  async findAll(@Param('electionId') electionId: string) {
    return this.candidatesService.findAll(electionId);
  }

  @Get('election/:electionId/stats')
  @ApiOperation({ summary: 'Get candidate statistics for an election' })
  @ApiResponse({ status: 200, description: 'Candidate statistics retrieved successfully' })
  async getStats(@Param('electionId') electionId: string) {
    return this.candidatesService.getCandidateStats(electionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({ status: 200, description: 'Candidate retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto, @Request() req) {
    return this.candidatesService.update(id, updateCandidateDto, req.user._id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.candidatesService.remove(id, req.user._id);
    return { message: 'Candidate deleted successfully' };
  }
}
