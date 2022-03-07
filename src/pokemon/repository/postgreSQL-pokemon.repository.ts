import { PokemonEntity } from './entities/pokemon.entity';
import { Injectable } from '@nestjs/common';
import { Pokemon } from '../service/models/pokemon';
import { PokemonRepository } from './pokemon.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonMapper } from './mappers/pokemon.mapper';

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
    return PokemonMapper.entityToPokemon(pokemonEntity);
  }
}
