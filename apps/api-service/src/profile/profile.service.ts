import {
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProfileDto } from '../dtos/profile.dto';
import { User } from '@sprint-sync/storage';
import {
  changePassword,
  createUser,
  listUsers,
  updateProfile,
} from '@sprint-sync/control';
import { ChangePasswordDto } from './changePassword.dto';
import { CreateUserRequestDto } from './createUserRequest.dto';

@Injectable()
export class ProfileService {
  constructor(private source: DataSource) {}

  /**
   * User id
   * @param id
   */
  async getById(id: number) {
    const user = await this.source.manager.findOneByOrFail(User, { id });
    return {
      ...user,
      profile: await user.profile,
    };
  }

  async list(
    pageSize: number,
    username: string | null,
    nextPageToken: string | null,
  ) {
    const page = await listUsers(
      this.source.manager,
      pageSize,
      username ?? null,
      nextPageToken ?? null,
    );
    return {
      nextPageToken: page.nextPageToken,
      users: await Promise.all(
        page.users.map(async (user) => ({
          ...user,
          profile: await user.profile,
        })),
      ),
    };
  }

  async update(id: number, body: ProfileDto) {
    await updateProfile(this.source.manager, id, {
      first_name: body.first_name,
      last_name: body.last_name,
    });
    return this.getById(id);
  }

  async updatePassword(id: number, body: ChangePasswordDto) {
    const success = await changePassword(
      this.source.manager,
      id,
      body.newPassword,
      body.oldPassword,
    );
    if (!success) {
      throw new ForbiddenException('Incorrect password');
    }
  }

  async create(body: CreateUserRequestDto) {
    return await this.source.manager.transaction(async (manager) => {
      const exists = await manager.existsBy(User, { username: body.username });
      if (exists) {
        throw new UnprocessableEntityException('Username already exists');
      }
      return createUser(manager, body.username, body.password, {
        first_name: body.first_name,
        last_name: body.last_name,
      });
    });
  }
}
