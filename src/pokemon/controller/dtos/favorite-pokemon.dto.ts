import { IsBoolean } from 'class-validator';

export class FavoritePokemonDto {
  @IsBoolean()
  favorite: boolean;
}
