import { AttackTypeEntity } from 'src/pokemon/repository/entities/attack-type.entity';
import { AttackEntity } from 'src/pokemon/repository/entities/attack.entity';
import { PokemonTypeEntity } from 'src/pokemon/repository/entities/pokemon-type.entity';
import { PokemonEntity } from 'src/pokemon/repository/entities/pokemon.entity';
import { Connection } from 'typeorm';
import { Seeder, Factory } from 'typeorm-seeding';
import pokemons from './pokemons.json';

export default class LoadPokedex implements Seeder {
  pokemonTypesInserted: PokemonTypeEntity[] = [];
  pokemonAttacksInserted: AttackEntity[] = [];
  pokemonAttacksCategories: AttackTypeEntity[] = [];

  public async run(factory: Factory, connection: Connection): Promise<any> {
    this.pokemonTypesInserted = await connection.getRepository(PokemonTypeEntity).find();
    this.pokemonAttacksCategories = await this.saveAttackCategories(connection);

    for (let i = 0; i < pokemons.length; i++) {
      await this.insertAll(connection, pokemons[i]);
    }
    for (let i = 0; i < pokemons.length; i++) {
      await this.addEvolutionInfo(connection, pokemons[i]);
    }
  }

  public async buildPokemon(connection: Connection, pokemonItem: any): Promise<PokemonEntity> {
    const pokemon = connection.manager.create(PokemonEntity, {
      id: parseInt(pokemonItem.id),
      name: pokemonItem.name,
      classification: pokemonItem.classification,
      fleeRate: pokemonItem.fleeRate,
      maxCP: pokemonItem.maxCP,
      maxHP: pokemonItem.maxHP,
      weightMin: pokemonItem.weight.minimum,
      weightMax: pokemonItem.weight.maximum,
      heightMin: pokemonItem.height.minimum,
      heightMax: pokemonItem.height.maximum,
      amountEvolutionRequirement: pokemonItem.evolutionRequirements?.amount,
      nameEvolutionRequirement: pokemonItem.evolutionRequirements?.name,
    });
    return pokemon;
  }

  public createPartialPokemonTypes(connection: Connection, pokemonTypes: string[]): PokemonTypeEntity[] {
    const pokemonTypesEntity: PokemonTypeEntity[] = [];
    pokemonTypes.map((pokemonTypeObject) => {
      const partialPokemonEntityType = connection.manager.create(PokemonTypeEntity, { type: pokemonTypeObject });
      pokemonTypesEntity.push(partialPokemonEntityType);
    });
    return pokemonTypesEntity;
  }

  public findPokemonTypesToInsert(allPokemonTypes: string[]): string[] {
    const pokemonTypesToInsert = allPokemonTypes.filter(
      (typeName) => !this.pokemonTypesInserted.some((pokemonTypeEntity) => pokemonTypeEntity.type === typeName),
    );
    return pokemonTypesToInsert;
  }

  private getPokemonAttackTypes(pokemonAttack: any): string[] {
    const pokemonAttackTypes: string[] = [];
    pokemonAttack?.fast?.map((fastAttack: any) => {
      pokemonAttackTypes.push(fastAttack.type);
    });
    pokemonAttack?.special?.map((specialAttack: any) => {
      pokemonAttackTypes.push(specialAttack.type);
    });
    return pokemonAttackTypes;
  }

  public async insertAll(connection: Connection, rawPokemon: any): Promise<void> {
    const pokemon = await this.buildPokemon(connection, rawPokemon);
    const pokemonAttackTypes = this.getPokemonAttackTypes(rawPokemon.attacks);

    const allTypes = [
      ...new Set([...rawPokemon.types, ...rawPokemon.resistant, ...rawPokemon.weaknesses, ...pokemonAttackTypes]),
    ];
    const pokemonTypesNameToInsert = this.findPokemonTypesToInsert(allTypes);
    const pokemonTypesEntityToInsert = this.createPartialPokemonTypes(connection, pokemonTypesNameToInsert);
    let pokemonTypeEntitiescreated;
    try {
      pokemonTypeEntitiescreated = await connection.getRepository(PokemonTypeEntity).save(pokemonTypesEntityToInsert);
    } catch (error) {
      console.log(error);
    }
    this.pokemonTypesInserted = [...new Set([...pokemonTypeEntitiescreated, ...this.pokemonTypesInserted])];

    const filteredArrayTypes = this.pokemonTypesInserted.filter((pokemonTypeName) =>
      rawPokemon.types.includes(pokemonTypeName.type),
    );

    const filteredArrayResistant = this.pokemonTypesInserted.filter((pokemonTypeName) =>
      rawPokemon.resistant.includes(pokemonTypeName.type),
    );

    const filteredArrayWeaknesses = this.pokemonTypesInserted.filter((pokemonTypeName) =>
      rawPokemon.weaknesses.includes(pokemonTypeName.type),
    );

    const pokemonAttacks = await this.getAndCreatePokemonAttacks(connection, rawPokemon.attacks);

    await connection.manager.createQueryBuilder().insert().into(PokemonEntity).values(pokemon).execute();

    await connection.manager
      .createQueryBuilder()
      .relation(PokemonEntity, 'pokemonType')
      .of(pokemon.id)
      .add(filteredArrayTypes.flatMap((pokemonType) => pokemonType.id));

    await connection.manager
      .createQueryBuilder()
      .relation(PokemonEntity, 'resistant')
      .of(pokemon.id)
      .add(filteredArrayResistant.flatMap((pokemonType) => pokemonType.id));

    await connection.manager
      .createQueryBuilder()
      .relation(PokemonEntity, 'weaknesses')
      .of(pokemon.id)
      .add(filteredArrayWeaknesses.flatMap((pokemonType) => pokemonType.id));

    await connection.manager
      .createQueryBuilder()
      .relation(PokemonEntity, 'attacks')
      .of(pokemon.id)
      .add(pokemonAttacks.flatMap((attack) => attack.id));
  }

  public async addEvolutionInfo(connection: Connection, rawPokemon: any): Promise<void> {
    if (!!rawPokemon.evolutions) {
      await this.insertEvolutions(
        connection,
        rawPokemon,
        rawPokemon.evolutions.flatMap((evolution) => evolution.id),
        'evolutions',
      );
    }
    if (!!rawPokemon['Previous evolution(s)']) {
      await this.insertEvolutions(
        connection,
        rawPokemon,
        rawPokemon['Previous evolution(s)'].flatMap((evolution) => evolution.id),
        'previousEvolutions',
      );
    }
  }

  public isAttackInserted(attackName: string): AttackEntity {
    return this.pokemonAttacksInserted.find((attackEntity) => attackEntity.name === attackName);
  }

  public async getAndCreatePokemonAttacks(connection: Connection, pokemonAttack: any): Promise<AttackEntity[]> {
    const pokemonAttacksEntity: AttackEntity[] = [];

    if (!!pokemonAttack) {
      if (!!pokemonAttack.fast) {
        for (let i = 0; i < pokemonAttack.fast.length; i++) {
          const fastAttackCreated = this.isAttackInserted(pokemonAttack.fast[i].name);
          if (!fastAttackCreated) {
            const fastAttackEntity = await this.buildAttack(connection, pokemonAttack.fast[i], 'fast');
            pokemonAttacksEntity.push(fastAttackEntity);
          } else {
            pokemonAttacksEntity.push(fastAttackCreated);
          }
        }
      }
      if (!!pokemonAttack.special) {
        for (let i = 0; i < pokemonAttack.special.length; i++) {
          const specialAttackCreated = this.isAttackInserted(pokemonAttack.special[i].name);
          if (!specialAttackCreated) {
            const specialAttackEntity = await this.buildAttack(connection, pokemonAttack.special[i], 'special');
            pokemonAttacksEntity.push(specialAttackEntity);
          } else {
            pokemonAttacksEntity.push(specialAttackCreated);
          }
        }
      }
    }
    return pokemonAttacksEntity;
  }

  public async saveAttackCategories(connection: Connection): Promise<AttackTypeEntity[]> {
    const fastAttackTypeEntity = new AttackTypeEntity('fast');
    const specialAttackTypeEntity = new AttackTypeEntity('special');
    return await connection.manager.save([fastAttackTypeEntity, specialAttackTypeEntity]);
  }

  public async buildAttack(connection: Connection, attack: any, category: string): Promise<AttackEntity> {
    const partialAttackEntity = connection.manager.create(AttackEntity, {
      name: attack.name,
      damage: attack.damage,
    });
    const attackEntity = await connection.manager.save(partialAttackEntity);
    const attackTypeEntity = this.pokemonTypesInserted.find((pokemonTypeName) => attack.type === pokemonTypeName.type);
    const attackCategory = this.pokemonAttacksCategories.find(
      (attackTypeEntity) => attackTypeEntity.typeName === category,
    );

    await connection.manager
      .createQueryBuilder()
      .relation(AttackEntity, 'type')
      .of(attackEntity.id)
      .set(attackTypeEntity.id);

    await connection.manager
      .createQueryBuilder()
      .relation(AttackEntity, 'category')
      .of(attackEntity.id)
      .set(attackCategory.id);

    this.pokemonAttacksInserted.push(attackEntity);
    return attackEntity;
  }

  public async insertEvolutions(
    connection: Connection,
    rawPokemon: any,
    evolutions: number[],
    tableName: string,
  ): Promise<void> {
    await connection.manager
      .createQueryBuilder()
      .relation(PokemonEntity, tableName)
      .of(parseInt(rawPokemon.id))
      .add(evolutions);
  }
}
