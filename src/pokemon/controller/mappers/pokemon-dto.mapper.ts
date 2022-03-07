import { PokemonDto } from './../dtos/pokemon.dto';
import { Pokemon } from './../../service/models/pokemon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PokemonDtoMapper {
  public static pokemonToPokemonDto(pokemon: Pokemon): PokemonDto {
    const pokemonDto: PokemonDto = { ...pokemon };
    return pokemonDto;
  }
}