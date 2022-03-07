import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AttackTypeEntity } from './attack-type.entity';
import { PokemonTypeEntity } from './pokemon-type.entity';

@Entity('attack')
export class AttackEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  damage: number;

  @ManyToOne(
    () => PokemonTypeEntity,
    (pokemonTypeEntity) => pokemonTypeEntity.attacks,
  )
  type: PokemonTypeEntity;

  @ManyToOne(
    () => AttackTypeEntity,
    (attackTypeEntity) => attackTypeEntity.attacks,
    { cascade: true },
  )
  category: AttackTypeEntity;
}
