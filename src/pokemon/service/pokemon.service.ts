import { QueryParams } from './../domain/query-params';
import { Inject, Injectable } from '@nestjs/common';
import { pokemonRepositorySymbol } from '../pokemon.provider';
import { PokemonRepository } from '../repository/pokemon.repository';
import { Pokemon } from './models/pokemon';
import { Page } from '../domain/pagination/page';
import { PageOptions } from '../domain/pagination/page-options';

@Injectable()
export class PokemonService {
  constructor(
    @Inject(pokemonRepositorySymbol)
    private pokemonRepository: PokemonRepository,
  ) {}

  async getPokemonById(id: number): Promise<Pokemon> {
    const pokemon: Pokemon = await this.pokemonRepository.getPokemonById(id);
    return pokemon;
  }

  async getPokemons(pageOptions: PageOptions, queryParams: QueryParams): Promise<Page<Pokemon>> {
    return await this.pokemonRepository.getPokemons(pageOptions, queryParams);
  }
}
