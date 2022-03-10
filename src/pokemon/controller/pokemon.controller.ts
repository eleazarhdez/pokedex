import { PageDtoMapper } from './mappers/page-dto.mapper';
import { PokemonDto } from './dtos/pokemon.dto';
import { Controller, Get, Param, Query, UseFilters } from '@nestjs/common';
import { PokemonService } from '../service/pokemon.service';
import { PokemonDtoMapper } from './mappers/pokemon-dto.mapper';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ApiResponse } from '@nestjs/swagger';
import { QueryParamsDto } from './dtos/paramsDtos/query-params.dto';
import { QueryParams } from '../domain/query-params';
import { PageOptions } from '../domain/pagination/page-options';
import { PageOptionsDto } from './dtos/paginationDtos/page-options.dto';
import { PageDto } from './dtos/paginationDtos/page.dto';
import { PathParamsDto } from './dtos/paramsDtos/path-params.dto';

@UseFilters(HttpExceptionFilter)
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}
 
  @ApiResponse({ type: String, isArray: true })
  @Get('/types')
  async findPokemonsTypes(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() queryParamsDto: QueryParamsDto,
  ): Promise<PageDto<string>> {
    const pageOptions = new PageOptions(pageOptionsDto.order, pageOptionsDto.page, pageOptionsDto.take);
    const queryParams = new QueryParams(queryParamsDto.type, queryParamsDto.name);
    const pokemonTypePage = await this.pokemonService.getPokemonsTypes(pageOptions, queryParams);
    return PageDtoMapper.pokemonTypePageToPokemonTypePageDto(pokemonTypePage);
  }

  @ApiResponse({ type: PokemonDto })
  @Get(':id')
  async findPokemonById(@Param() pathParamsDto: PathParamsDto): Promise<PokemonDto> {
    const pokemon = await this.pokemonService.getPokemonById(pathParamsDto.id);
    return PokemonDtoMapper.pokemonToPokemonDto(pokemon);
  }

  @ApiResponse({ type: PokemonDto, isArray: true })
  @Get()
  async findPokemons(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() queryParamsDto: QueryParamsDto,
  ): Promise<PageDto<PokemonDto>> {
    const pageOptions = new PageOptions(pageOptionsDto.order, pageOptionsDto.page, pageOptionsDto.take);
    const queryParams = new QueryParams(queryParamsDto.type, queryParamsDto.name);
    const pokemonPage = await this.pokemonService.getPokemons(pageOptions, queryParams);
    return PageDtoMapper.pokemonPageToPokemonPageDto(pokemonPage);
  }


}
