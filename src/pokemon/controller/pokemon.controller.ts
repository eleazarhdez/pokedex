import { PokemonDto } from './dtos/pokemon.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { PokemonService } from '../service/pokemon.service';
import { PathParamsDto } from './dtos/path-params.dto';
import { PokemonDtoMapper } from './mappers/pokemon-dto.mapper';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get(':id')
  async findById(@Param() pathParamsDto: PathParamsDto): Promise<PokemonDto> {
    const pokemon = await this.pokemonService.getPokemonById(pathParamsDto.id);
    return PokemonDtoMapper.pokemonToPokemonDto(pokemon);
  }
}
