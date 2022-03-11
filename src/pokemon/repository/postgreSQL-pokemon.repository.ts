import { FavoritePokemonEntity } from './entities/favorite-pokemon.entity';
import { PokemonTypeEntity } from './entities/pokemon-type.entity';
import { NotFoundError } from '../domain/errors/not-found.error';
import { PokemonEntity } from './entities/pokemon.entity';
import { Injectable } from '@nestjs/common';
import { Pokemon } from '../service/models/pokemon';
import { PokemonRepository } from './pokemon.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    @InjectRepository(PokemonTypeEntity)
    private pokemonTypeRepository: Repository<PokemonTypeEntity>,
    @InjectRepository(FavoritePokemonEntity)
    private favoritePokemonRepository: Repository<FavoritePokemonEntity>,
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

  async getPokemonTypes(pageOptions?: PageOptions, queryParams?: QueryParams): Promise<Page<string>> {
    const [pokemonTypeEntities, itemCount] = await this.pokemonTypeRepository.findAndCount({
      where: queryParams.type ? { type: queryParams.type } : undefined,
      skip: pageOptions.skip,
      take: pageOptions.take,
    });

    if (Array.isArray(pokemonTypeEntities) && !pokemonTypeEntities.length) {
      throw new NotFoundError('Any pokemon type was found');
    }
    const pokemonTypes: string[] = [];
    pokemonTypeEntities.map((pokemonType) => pokemonTypes.push(pokemonType.type));

    const pageMeta = new PageMeta(pageOptions, itemCount);
    return new Page(pokemonTypes, pageMeta);
  }

  async markPokemonAsFavorite(pokemonId: number, isFavorite: boolean): Promise<void> {
    try {
      const pokemonFavorite: FavoritePokemonEntity = { id: pokemonId, favorite: isFavorite };
      await this.favoritePokemonRepository.save(pokemonFavorite);
    } catch (error) {
      console.log(error);
    }
  }

  async getFavoritePokemons(pageOptions?: PageOptions): Promise<Page<string>> {
    const favoritePokemonIds = await this.favoritePokemonRepository.find({
      select: ['id'],
      where: { favorite: true },
    });
    const favoriteIds: number[] = [];
    favoritePokemonIds.map((favoritePokemon) => favoriteIds.push(favoritePokemon.id));
    const [favoritePokemons, itemCount] = await this.pokemonRepository.findAndCount({
      where: { id: In(favoriteIds) },
      skip: pageOptions.skip,
      take: pageOptions.take,
    });

    if (Array.isArray(favoritePokemons) && !favoritePokemons.length) {
      throw new NotFoundError('Any favorite pokemon was found');
    }
    const favoritePokemonNames: string[] = [];
    favoritePokemons.map((pokemonName) => favoritePokemonNames.push(pokemonName.name));
    const pageMeta = new PageMeta(pageOptions, itemCount);
    return new Page(favoritePokemonNames, pageMeta);
  }
}
