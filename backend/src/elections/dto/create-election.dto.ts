import { IsString, IsDateString, IsEnum, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ElectionType } from '../../schemas/election.schema';

export class CreateElectionDto {
  @ApiProperty({ example: 'Student Council Election 2024' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Vote for your student council representatives' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description: string;

  @ApiProperty({ enum: ElectionType, example: ElectionType.PRIVATE })
  @IsEnum(ElectionType)
  type: ElectionType;

  @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2024-01-15T18:00:00.000Z' })
  @IsDateString()
  endAt: string;

  @ApiProperty({ example: '@university.edu', required: false })
  @IsOptional()
  @IsString()
  allowedDomain?: string;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  maxPublicVoters?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPublicResults?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  allowAnonymousVoting?: boolean;
}
