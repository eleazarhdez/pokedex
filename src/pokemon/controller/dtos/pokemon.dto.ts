import { ApiProperty } from '@nestjs/swagger';
import { AttackDto } from './attack.dto';

export type measures = {
  minimum: string;
  maximum: string;
};

export type evolutionRequirement = {
  amount: number;
  name: string;
};

export type evolution = {
  id: number;
  name: string;
};

export type attackList = {
  fast: AttackDto[];
  special: AttackDto[];
};

export class PokemonDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  classification: string;

  @ApiProperty()
  types: string[];

  @ApiProperty()
  resistant: string[];

  @ApiProperty()
  weaknesses: string[];

  @ApiProperty()
  weight: measures;

  @ApiProperty()
  height: measures;

  @ApiProperty()
  fleeRate: number;

  @ApiProperty()
  evolutionRequirements?: evolutionRequirement;

  @ApiProperty()
  previousEvolutions?: evolution[];

  @ApiProperty()
  evolutions?: evolution[];

  @ApiProperty()
  maxCP: number;

  @ApiProperty()
  maxHP: number;

  @ApiProperty()
  attacks: attackList;
}
