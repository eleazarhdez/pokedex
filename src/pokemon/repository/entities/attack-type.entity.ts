import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AttackEntity } from './attack.entity';

@Entity('attack_type')
export class AttackTypeEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ unique: true })
  typeName: string;

  @OneToMany(() => AttackEntity, (attack) => attack.category)
  attacks: AttackEntity[];

  constructor(category: string) {
    this.typeName = category;
  }
}
