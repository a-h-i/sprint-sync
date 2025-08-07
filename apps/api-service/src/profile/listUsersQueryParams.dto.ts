import {IsNumber, IsOptional, IsString, Max} from "class-validator";

export class ListUsersQueryParams {

    @IsOptional()
    @IsString()
    nextPageToken?: string | null;

    @IsNumber()
    @Max(100)
    pageSize!: number;

    @IsOptional()
    @IsString()
    username?: string | null;

}