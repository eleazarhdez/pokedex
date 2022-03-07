import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';
import { AttackEntity } from './attack.entity';
import { PokemonTypeEntity } from './pokemon-type.entity';

@Entity('pokemon')
export class PokemonEntity {
  @PrimaryColumn({ nullable: false })
  readonly id: number;

  @Column({ unique: true })
  readonly name: string;

  @Column()
  classification: string;

  @Column({
    type: 'decimal',
    precision: 2,
    scale: 2,
  })
  fleeRate: number;

  @Column()
  maxCP: number;

  @Column()
  maxHP: number;

  @Column({ nullable: true })
  weightMin: string;

  @Column({ nullable: true })
  weightMax: string;

  @Column({ nullable: true })
  heightMin: string;

  @Column({ nullable: true })
  heightMax: string;

  @Column({ nullable: true })
  amountEvolutionRequirement: number;

  @Column({ nullable: true })
  nameEvolutionRequirement: string;

  @ManyToMany(() => PokemonEntity, { cascade: true })
  @JoinTable()
  previousEvolutions: PokemonEntity[];

  @ManyToMany(() => PokemonEntity, { cascade: true })
  @JoinTable()
  evolutions: PokemonEntity[];

  @ManyToMany(() => PokemonTypeEntity, { cascade: true })
  @JoinTable()
  pokemonType: PokemonTypeEntity[];

  @ManyToMany(() => PokemonTypeEntity, { cascade: true })
  @JoinTable()
  resistant: PokemonTypeEntity[];

  @ManyToMany(() => PokemonTypeEntity, { cascade: true })
  @JoinTable()
  weaknesses: PokemonTypeEntity[];

  @ManyToMany(() => AttackEntity, { cascade: true })
  @JoinTable()
  attacks: AttackEntity[];
}
