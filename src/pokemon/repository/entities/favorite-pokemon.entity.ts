import { PrimaryColumn, Column, Entity } from 'typeorm';

@Entity('favorite_pokemon')
export class FavoritePokemonEntity {
  @PrimaryColumn({
    nullable: false,
  })
  readonly id: number;

  @Column()
  favorite: boolean;
}
