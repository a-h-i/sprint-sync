import {Expose, Type} from "class-transformer";
import {UserDto} from "../dtos/user.dto";


export class ListUsersResponseDto {

    @Expose()
    @Type(() => UserDto)
    users!: UserDto[];

    @Expose()
    nextPageToken!: string | null;
}