import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserDto } from '../dtos/user.dto';
import { ProfileService } from './profile.service';
import { plainToInstance } from 'class-transformer';
import { ListUsersResponseDto } from './listUsersResponse.dto';
import { ListUsersQueryParams } from './listUsersQueryParams.dto';
import { ProfileDto } from '../dtos/profile.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '@sprint-sync/storage';
import { CurrentUser } from '../auth/currentUser.decorator';
import { ChangePasswordDto } from './changePassword.dto';
import { CreateUserRequestDto } from './createUserRequest.dto';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(AuthGuard)
  @Get(':id')
  async profileById(@Param('id') id: number): Promise<UserDto> {
    const data = await this.profileService.getById(id);
    return plainToInstance(UserDto, data, { excludeExtraneousValues: true });
  }

  @UseGuards(AuthGuard)
  @Get('/')
  async listUsers(
    @Query() params: ListUsersQueryParams,
  ): Promise<ListUsersResponseDto> {
    const page = await this.profileService.list(
      params.pageSize,
      params.username ?? null,
      params.nextPageToken ?? null,
    );
    return plainToInstance(ListUsersResponseDto, page, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: ProfileDto,
    @CurrentUser() currentUser: User,
  ): Promise<UserDto> {
    if (currentUser.id.toString(10) !== id) {
      throw new ForbiddenException();
    }
    const data = await this.profileService.update(parseInt(id, 10), body);
    return plainToInstance(UserDto, data, { excludeExtraneousValues: true });
  }

  @UseGuards(AuthGuard)
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() body: ChangePasswordDto,
    @CurrentUser() currentUser: User,
  ): Promise<void> {
    if (currentUser.id.toString(10) !== id) {
      throw new ForbiddenException();
    }
    await this.profileService.updatePassword(parseInt(id, 10), body);
  }

  @Post('/')
  async createUser(@Body() body: CreateUserRequestDto): Promise<UserDto> {
    const data = await this.profileService.create(body);
    return plainToInstance(UserDto, await data.user.serialize(), {
      excludeExtraneousValues: true,
    });
  }
}
