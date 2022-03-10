import { PokemonDtoMapper } from './pokemon-dto.mapper';
import { PageMetaDto } from '../dtos/paginationDtos/page-meta.dto';
import { PageDto } from './../dtos/paginationDtos/page.dto';
import { Page } from './../../domain/pagination/page';
import { Injectable } from '@nestjs/common';
import { PokemonDto } from '../dtos/pokemon.dto';
import { Pokemon } from 'src/pokemon/service/models/pokemon';

@Injectable()
export class PageDtoMapper {
  public static pokemonPageToPokemonPageDto(page: Page<Pokemon>): PageDto<PokemonDto> {
    const meta: PageMetaDto = { ...page.meta };
    const data = page.data.map((pokemon) => PokemonDtoMapper.pokemonToPokemonDto(pokemon));
    return new Page(data, meta);
  }
}
