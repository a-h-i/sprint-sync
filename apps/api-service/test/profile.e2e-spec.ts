import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  FactoryGirl,
  FactoryGirlTypeOrmAdapter,
  Profile,
  setupPostgres,
  User,
} from '@sprint-sync/storage';

import { DataSource } from 'typeorm';
import { LoginService } from '../src/auth/login.service';
import { describe } from 'node:test';
import { plainToInstance } from 'class-transformer';
import { ListUsersResponseDto } from '../src/profile/listUsersResponse.dto';

import { setupApplication } from '../src/setupApplication';
import { UserDto } from '../src/dtos/user.dto';

describe('ProfileController (e2e)', () => {
  let app: INestApplication<App>;
  let source: DataSource;
  let user: User;
  let profiles: Profile[];
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApplication(app);
    await app.init();
    const loginService = moduleFixture.get(LoginService);
    source = await setupPostgres(true);
    FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
    profiles = await FactoryGirl.createMany<Profile>('Profile', 10);
    user = await source.manager.findOneByOrFail<User>(User, {
      id: profiles[0].user_id,
    });
    const loginData = await loginService.signIn(user.username, 'password');
    token = loginData.access_token;
  });

  afterAll(async () => {
    await source.query(`truncate users cascade`);
    await app.close();
    await source.destroy();
  });

  describe('/profile/:id (GET)', () => {
    it('gets user by id', async () => {
      const userId = profiles[1].user_id;
      const response = await request(app.getHttpServer())
        .get(`/profile/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toStrictEqual(200);
      expect(response.body['id']).toStrictEqual(userId);
    });
    it('requires authentication', async () => {
      const userId = profiles[1].user_id;
      return request(app.getHttpServer()).get(`/profile/${userId}`).expect(401);
    });
  });

  describe('/profile/:id (PUT)', () => {
    it('requires authentication', async () => {
      const userId = user.id;
      const profileData = {
        first_name: 'new first name',
        last_name: 'new last name',
      };
      await request(app.getHttpServer())
        .put(`/profile/${userId}`)
        .send(profileData)
        .expect(401);
    });
    it('updates user', async () => {
      const userId = user.id;
      const profileData = {
        first_name: 'new first name',
        last_name: 'new last name',
      };
      const response = await request(app.getHttpServer())
        .put(`/profile/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(200);
      const changedProfile = await source.manager.findOneByOrFail<Profile>(
        Profile,
        {
          user_id: userId,
        },
      );
      expect(changedProfile.first_name).toStrictEqual(profileData.first_name);
      expect(changedProfile.last_name).toStrictEqual(profileData.last_name);
    });
    it('forbids updating other users', async () => {
      const userId = profiles[1].user_id;
      const profileData = {
        first_name: 'new first name',
        last_name: 'new last name',
      };
      await request(app.getHttpServer())
        .put(`/profile/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(403);
    });
  });

  describe('/profile (GET)', () => {
    it('requires authentication', async () => {
      return request(app.getHttpServer()).get('/profile').expect(401);
    });
    it('gets user list', async () => {
      const firstPageResponse = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .query({ pageSize: 5 });
      expect(firstPageResponse.status).toStrictEqual(200);
      const parsedFirstPage = plainToInstance(
        ListUsersResponseDto,
        firstPageResponse.body,
      );
      expect(parsedFirstPage.nextPageToken).not.toBeNull();
      expect(parsedFirstPage.users).toHaveLength(5);
      const secondPageResponse = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .query({ pageSize: 5, nextPageToken: parsedFirstPage.nextPageToken });
      expect(secondPageResponse.status).toStrictEqual(200);
      const parsedSecondPage = plainToInstance(
        ListUsersResponseDto,
        secondPageResponse.body,
      );
      expect(parsedSecondPage.nextPageToken).toBeNull();
      const users = await source.manager.find(User, {
        order: {
          id: 'ASC',
        },
      });
      const ids = users.map((user) => user.id);
      expect(parsedSecondPage.users).toHaveLength(5);
    });
  });

  describe('/profile (POST)', () => {
    it('creates user', async () => {
      const userCountBefore = await source.manager.count(User);
      const data = {
        first_name: 'new first name',
        last_name: 'new last name',
        username: 'new username',
        password: 'password',
      };
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send(data);

      expect(response.status).toStrictEqual(201);
      const userCountAfter = await source.manager.count(User);
      expect(userCountAfter).toStrictEqual(userCountBefore + 1);
      const parsedResponse = plainToInstance(UserDto, response.body);
      expect(parsedResponse.username).toStrictEqual(data.username);
      expect(parsedResponse.profile.first_name).toStrictEqual(data.first_name);
    });
    it('fails if username already exists', async () => {
      const userCountBefore = await source.manager.count(User);
      const data = {
        first_name: 'new first name',
        last_name: 'new last name',
        username: user.username,
        password: 'password',
      };
      const response = await request(app.getHttpServer())
        .post('/profile')
        .send(data);

      expect(response.status).toStrictEqual(422);
      const userCountAfter = await source.manager.count(User);
      expect(userCountAfter).toStrictEqual(userCountBefore);
    });
  });

  describe('/profile/:id/password (PATCH)', () => {
    it('requires authentication', async () => {
      const data = {
        oldPassword: 'password',
        newPassword: 'password2',
      };
      await request(app.getHttpServer())
        .patch(`/profile/${user.id}/password`)
        .send(data)
        .expect(401);
    });
    it('changes password', async () => {
      const data = {
        oldPassword: 'password',
        newPassword: 'password2',
      };
      const user = await source.manager.findOneByOrFail(User, {
        id: profiles[2].user_id,
      });
      const loginInfo = await app
        .get(LoginService)
        .signIn(user.username, 'password');
      await request(app.getHttpServer())
        .patch(`/profile/${user.id}/password`)
        .send(data)
        .set('Authorization', `Bearer ${loginInfo.access_token}`)
        .expect(200);
      expect(() =>
        app.get(LoginService).signIn(user.username, 'password2'),
      ).not.toThrow();
    });
    it('fails if old password is incorrect', async () => {
      const data = {
        oldPassword: 'wrong password',
        newPassword: 'password2',
      };
      await request(app.getHttpServer())
        .patch(`/profile/${user.id}/password`)
        .send(data)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
    it('does not allow changing another users password', async () => {
      const data = {
        oldPassword: 'password',
        newPassword: 'password2',
      };
      await request(app.getHttpServer())
        .patch(`/profile/${profiles[2].user_id}/password`)
        .send(data)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
