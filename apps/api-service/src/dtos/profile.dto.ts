import { Expose } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class ProfileDto {
  @Expose()
  @IsString()
  @MinLength(1)
  first_name!: string;
  @Expose()
  @IsString()
  @MinLength(1)
  last_name!: string;
}
