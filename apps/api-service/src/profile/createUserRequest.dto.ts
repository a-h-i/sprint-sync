import {IsString, MinLength} from "class-validator";


export class CreateUserRequestDto {
    @IsString()
    @MinLength(1)
    first_name!: string;
    @IsString()
    @MinLength(1)
    last_name!: string;
    @IsString()
    @MinLength(6)
    password!: string;
    @IsString()
    @MinLength(1)
    username!: string;
}