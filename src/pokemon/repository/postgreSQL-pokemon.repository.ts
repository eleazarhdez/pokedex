import { NotFoundError } from '../domain/errors/not-found.error';
import { PokemonEntity } from './entities/pokemon.entity';
import { Injectable } from '@nestjs/common';
import { Pokemon } from '../service/models/pokemon';
import { PokemonRepository } from './pokemon.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonMapper } from './mappers/pokemon.mapper';
import { PageMeta } from '../domain/pagination/page-meta';
import { PageOptions } from '../domain/pagination/page-options';
import { QueryParams } from '../domain/query-params';
import { Page } from '../domain/pagination/page';

@Injectable()
export class PostgreSQLPokemonRepository implements PokemonRepository {
  constructor(
    @InjectRepository(PokemonEntity)
    private pokemonRepository: Repository<PokemonEntity>,
  ) {}

  pokemonRelations = [
    'pokemonType',
    'resistant',
    'weaknesses',
    'previousEvolutions',
    'evolutions',
    'attacks',
    'attacks.type',
    'attacks.category',
  ];

  async getPokemonById(pokemonId: number): Promise<Pokemon> {
    const pokemonEntity: PokemonEntity = await this.pokemonRepository.findOne({
      where: { id: pokemonId },
      relations: this.pokemonRelations,
    });
    if (!pokemonEntity) {
      throw new NotFoundError('Pokemon not Found');
    }
    return PokemonMapper.entityToPokemon(pokemonEntity);
  }

  async getPokemons(pageOptions?: PageOptions, queryParams?: QueryParams): Promise<Page<Pokemon>> {
    const query = this.pokemonRepository
      .createQueryBuilder('pokemon')
      .leftJoinAndSelect('pokemon.pokemonType', 'pokemonType')
      .leftJoinAndSelect('pokemon.resistant', 'resistant')
      .leftJoinAndSelect('pokemon.weaknesses', 'weaknesses')
      .leftJoinAndSelect('pokemon.previousEvolutions', 'previousEvolutions')
      .leftJoinAndSelect('pokemon.evolutions', 'evolutions')
      .leftJoinAndSelect('pokemon.attacks', 'attacks')
      .leftJoinAndSelect('attacks.type', 'attackTypes')
      .leftJoinAndSelect('attacks.category', 'attackCategories');
    if (!!queryParams.name) {
      query.andWhere('pokemon.name = :name', { name: queryParams.name });
    }
    if (!!queryParams.type) {
      query.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('pokemon.id', 'id')
          .from(PokemonEntity, 'pokemon')
          .leftJoin('pokemon.pokemonType', 'pokemonType')
          .where('pokemonType.type = :type', { type: queryParams.type })
          .getQuery();
        return 'pokemon.id IN ' + subQuery;
      });
    }
    const [pokemonEntities, itemCount] = await query.skip(pageOptions.skip).take(pageOptions.take).getManyAndCount();

    if (Array.isArray(pokemonEntities) && !pokemonEntities.length) {
      throw new NotFoundError('Any pokemon was found');
    }
    const pokemons: Pokemon[] = pokemonEntities.map((pokemonEntity) => PokemonMapper.entityToPokemon(pokemonEntity));
    const pageMeta = new PageMeta(pageOptions, itemCount);

    return new Page(pokemons, pageMeta);
  }
}
