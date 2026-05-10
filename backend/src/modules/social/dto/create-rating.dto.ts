import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsMongoId, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: '65812345678901234567890a' })
  @IsMongoId()
  @IsNotEmpty()
  filmId: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 10 })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsNotEmpty()
  score: number;

  @ApiProperty({ example: 'Tuyệt vời!', required: false })
  @IsString()
  @IsOptional()
  content?: string;
}
