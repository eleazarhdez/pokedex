import { PostgreSQLPokemonRepository } from './repository/postgreSQL-pokemon.repository';
import { Module } from '@nestjs/common';
import { pokemonRepositorySymbol } from './pokemon.provider';
import { PokemonMapper } from './repository/mappers/pokemon.mapper';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PokemonEntity } from './repository/entities/pokemon.entity';
import { AttackTypeEntity } from './repository/entities/attack-type.entity';
import { PokemonTypeEntity } from './repository/entities/pokemon-type.entity';
import { AttackEntity } from './repository/entities/attack.entity';
import { PokemonService } from './service/pokemon.service';
import { PokemonController } from './controller/pokemon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PokemonEntity, PokemonTypeEntity, AttackEntity, AttackTypeEntity])],
  controllers: [PokemonController],
  providers: [
    PokemonService,
    PokemonMapper,
    {
      provide: pokemonRepositorySymbol,
      useClass: PostgreSQLPokemonRepository,
    },
  ],
})
export class PokemonModule {}
