import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '65812345678901234567890a' })
  @IsMongoId()
  @IsNotEmpty()
  filmId: string;

  @ApiProperty({ example: 'Phim hay quá!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '65812345678901234567890b', required: false })
  @IsMongoId()
  @IsOptional()
  parentCommentId?: string;
}
