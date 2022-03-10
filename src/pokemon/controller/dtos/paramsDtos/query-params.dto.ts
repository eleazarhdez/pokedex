import { PokemonType } from '../enumDtos/pokemon-type.enum.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryParamsDto {
  @ApiPropertyOptional({ enum: PokemonType })
  @IsEnum(PokemonType)
  @IsOptional()
  @Transform((type) => type.value.charAt(0).toUpperCase() + type.value.substring(1))
  readonly type?: PokemonType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform((type) => type.value.charAt(0).toUpperCase() + type.value.substring(1))
  readonly name?: string;
}
