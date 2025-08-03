import {Expose, Type} from "class-transformer";
import {ProfileDto} from "./profile.dto";


export class UserDto {
    @Expose()
    id!: number;

    @Expose()
    username!: string;

    @Expose()
    @Type(() => ProfileDto)
    profile!: ProfileDto;

    @Expose()
    is_admin!: boolean;
}