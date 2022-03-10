import { Pokemon } from '../service/models/pokemon';
import { QueryParams } from '../domain/query-params';
import { Page } from '../domain/pagination/page';
import { PageOptions } from '../domain/pagination/page-options';

export interface PokemonRepository {
  getPokemonById(id: number): Promise<Pokemon>;

  getPokemons(pageOptions?: PageOptions, queryParams?: QueryParams): Promise<Page<Pokemon>>;
}
