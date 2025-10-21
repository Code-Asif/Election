import { Controller, Post, Get, Body, Param, UseGuards, Request, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('cast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cast a vote' })
  @ApiResponse({ status: 201, description: 'Vote cast successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async castVote(@Body() castVoteDto: CastVoteDto, @Request() req, @Req() request) {
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];
    
    return this.votesService.castVote(
      castVoteDto, 
      req.user._id, 
      req.user.email,
      ipAddress,
      userAgent
    );
  }

  @Get('results/:electionId')
  @ApiOperation({ summary: 'Get election results' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getResults(@Param('electionId') electionId: string) {
    return this.votesService.getVoteResults(electionId);
  }

  @Get('check/:electionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if user has voted in an election' })
  @ApiResponse({ status: 200, description: 'Vote status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkVoteStatus(@Param('electionId') electionId: string, @Request() req) {
    const hasVoted = await this.votesService.hasUserVoted(electionId, req.user.email);
    return { hasVoted };
  }
}
