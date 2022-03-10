import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class PathParamsDto {
  @Type(() => Number)
  @IsInt()
  id: number;
}
