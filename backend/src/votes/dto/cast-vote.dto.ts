import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty({ example: '64f1b2c3d4e5f6a7b8c9d0e1' })
  @IsString()
  @IsNotEmpty()
  electionId: string;

  @ApiProperty({ example: '64f1b2c3d4e5f6a7b8c9d0e2' })
  @IsString()
  @IsNotEmpty()
  candidateId: string;
}
