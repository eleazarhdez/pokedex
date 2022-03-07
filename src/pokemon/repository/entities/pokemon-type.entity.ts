import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttackEntity } from './attack.entity';

@Entity('pokemon_type')
export class PokemonTypeEntity {
  @PrimaryGeneratedColumn('increment')
  readonly id: number;

  @Column({ unique: true })
  type: string;

  @OneToMany(() => AttackEntity, (attack) => attack.type, { cascade: true })
  attacks: AttackEntity[];

  constructor(type: string) {
    this.type = type;
  }
}
