import { Inject, Injectable } from '@nestjs/common';
import { pokemonRepositorySymbol } from '../pokemon.provider';
import { PokemonRepository } from '../repository/pokemon.repository';
import { Pokemon } from './models/pokemon';

@Injectable()
export class PokemonService {
  constructor(
    @Inject(pokemonRepositorySymbol)
    private pokemonRepository: PokemonRepository){}

  async getPokemonById(id: number): Promise<Pokemon> {
    const pokemon: Pokemon = await this.pokemonRepository.getPokemonById(id);
    return pokemon;
  }
}
