import { Injectable } from '@nestjs/common';
import { Attack } from '../../service/models/attack';
import {
  attackList,
  evolution,
  evolutionRequirement,
  measures,
  Pokemon,
} from '../../service/models/pokemon';
import { AttackEntity } from '../entities/attack.entity';
import { PokemonEntity } from '../entities/pokemon.entity';

@Injectable()
export class PokemonMapper {
  static entityToPokemon(entity: PokemonEntity): Pokemon {
    const pokemonWeight: measures = {
      minimum: entity.weightMin,
      maximum: entity.weightMax,
    };
    const pokemonHeight: measures = {
      minimum: entity.heightMin,
      maximum: entity.heightMax,
    };
    const pokemonAttacks: attackList = {
      fast: [],
      special: [],
    };
    const pokemonEvolutionRequirements: evolutionRequirement = {
      amount: entity.amountEvolutionRequirement,
      name: entity.nameEvolutionRequirement,
    };

    const pokemon: Pokemon = {
      id: entity.id,
      name: entity.name,
      classification: entity.classification,
      fleeRate: entity.fleeRate,
      maxCP: entity.maxCP,
      maxHP: entity.maxHP,
      weight: pokemonWeight,
      height: pokemonHeight,
      attacks: pokemonAttacks,
      types: [],
      resistant: [],
      weaknesses: [],
    };
    if (Array.isArray(entity.evolutions) && entity.evolutions.length != 0) {
      pokemon.evolutions = [];
      entity.evolutions.map((pokemonToEvolve) =>
        pokemon.evolutions.push(this.pokemonToEvolution(pokemonToEvolve)),
      );
    }
    if (
      Array.isArray(entity.previousEvolutions) &&
      entity.previousEvolutions.length != 0
    ) {
      pokemon.previousEvolutions = [];
      entity.previousEvolutions.map((pokemonFromEvolve) =>
        pokemon.previousEvolutions.push(
          this.pokemonToEvolution(pokemonFromEvolve),
        ),
      );
    }
    if (
      pokemonEvolutionRequirements.amount != null &&
      pokemonEvolutionRequirements.name != null
    ) {
      pokemon.evolutionRequirements = pokemonEvolutionRequirements;
    }
    entity.pokemonType.map((pokemonType) =>
      pokemon.types.push(pokemonType.type),
    );
    entity.resistant.map((pokemonType) =>
      pokemon.resistant.push(pokemonType.type),
    );
    entity.weaknesses.map((pokemonType) =>
      pokemon.weaknesses.push(pokemonType.type),
    );
    entity.attacks.map((attackEntity) =>
      this.mapPokemonAttacks(pokemon.attacks, attackEntity),
    );
    return pokemon;
  }

  static pokemonToEvolution(entity: PokemonEntity): evolution {
    const pokemonEvolution: evolution = {
      id: entity.id,
      name: entity.name,
    };
    return pokemonEvolution;
  }

  static attackEntityToAttack(attackEntity: AttackEntity): Attack {
    const attack = new Attack(attackEntity.name, attackEntity.damage);
    attack.type = attackEntity.type.type;
    return attack;
  }

  static mapPokemonAttacks(
    pokemonAttacks: attackList,
    attackEntity: AttackEntity,
  ) {
    const attack: Attack = this.attackEntityToAttack(attackEntity);
    switch (attackEntity.category.id) {
      case 1: {
        pokemonAttacks.fast.push(attack);
        break;
      }
      case 2: {
        pokemonAttacks.special.push(attack);
        break;
      }
      default: {
        break;
      }
    }
  }
}
