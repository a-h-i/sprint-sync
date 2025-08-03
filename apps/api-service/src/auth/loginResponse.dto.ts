import {Expose, Type} from "class-transformer";
import {UserDto} from "../dtos/user.dto";


export class LoginResponseDto {
    @Expose()
    access_token!: string;

    @Expose()
    @Type(() => UserDto)
    user!: UserDto;
}