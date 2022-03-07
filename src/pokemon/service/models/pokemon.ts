import { Attack } from './attack';

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
  fast: Attack[];
  special: Attack[];
};

export class Pokemon {
  id: number;
  name: string;
  classification: string;
  types: string[];
  resistant: string[];
  weaknesses: string[];
  weight: measures;
  height: measures;
  fleeRate: number;
  evolutionRequirements?: evolutionRequirement;
  previousEvolutions?: evolution[];
  evolutions?: evolution[];
  maxCP: number;
  maxHP: number;
  attacks: attackList;
}
