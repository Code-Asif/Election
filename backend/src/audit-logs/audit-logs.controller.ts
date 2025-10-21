import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { AuditAction } from '../schemas/audit-log.schema';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs (Admin only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async findAll(
    @Query('limit') limit: number = 100,
    @Query('offset') offset: number = 0
  ) {
    return this.auditLogsService.findAll(limit, offset);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  async getStats() {
    return this.auditLogsService.getAuditStats();
  }

  @Get('election/:electionId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit logs for an election (Admin only)' })
  @ApiResponse({ status: 200, description: 'Election audit logs retrieved successfully' })
  async findByElection(@Param('electionId') electionId: string) {
    return this.auditLogsService.findByElection(electionId);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit logs for a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User audit logs retrieved successfully' })
  async findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get('action/:action')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by action (Admin only)' })
  @ApiResponse({ status: 200, description: 'Action audit logs retrieved successfully' })
  async findByAction(@Param('action') action: AuditAction) {
    return this.auditLogsService.findByAction(action);
  }
}
