import { Pokemon } from "../service/models/pokemon";

export interface PokemonRepository {
  getPokemonById(id: number): Promise<Pokemon>;
}