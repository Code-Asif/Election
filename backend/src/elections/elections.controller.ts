import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Elections')
@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new election' })
  @ApiResponse({ status: 201, description: 'Election created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createElectionDto: CreateElectionDto, @Request() req) {
    return this.electionsService.create(createElectionDto, req.user._id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all elections' })
  @ApiResponse({ status: 200, description: 'Elections retrieved successfully' })
  async findAll(@Request() req, @Query('public') isPublic?: boolean) {
    if (isPublic) {
      return this.electionsService.findPublicElections();
    }
    
    return this.electionsService.findAll(req.user._id, req.user.role);
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public elections' })
  @ApiResponse({ status: 200, description: 'Public elections retrieved successfully' })
  async findPublicElections() {
    return this.electionsService.findPublicElections();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get election by slug' })
  @ApiResponse({ status: 200, description: 'Election retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.electionsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election by ID' })
  @ApiResponse({ status: 200, description: 'Election retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?._id || null;
    const userRole = req.user?.role || null;
    return this.electionsService.findOne(id, userId, userRole);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get election statistics' })
  @ApiResponse({ status: 200, description: 'Election statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Election not found' })
  async getStats(@Param('id') id: string) {
    return this.electionsService.getElectionStats(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update election' })
  @ApiResponse({ status: 200, description: 'Election updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(@Param('id') id: string, @Body() updateElectionDto: UpdateElectionDto, @Request() req) {
    return this.electionsService.update(id, updateElectionDto, req.user._id);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start election' })
  @ApiResponse({ status: 200, description: 'Election started successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async startElection(@Param('id') id: string, @Request() req) {
    return this.electionsService.startElection(id, req.user._id);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close election' })
  @ApiResponse({ status: 200, description: 'Election closed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async closeElection(@Param('id') id: string, @Request() req) {
    return this.electionsService.closeElection(id, req.user._id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete election' })
  @ApiResponse({ status: 200, description: 'Election deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.electionsService.remove(id, req.user._id);
    return { message: 'Election deleted successfully' };
  }
}
