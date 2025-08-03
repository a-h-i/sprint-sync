import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {FactoryGirl, FactoryGirlTypeOrmAdapter, Profile, setupPostgres, User} from "@sprint-sync/storage";
import {DataSource} from "typeorm";
import {plainToInstance} from "class-transformer";
import {LoginResponseDto} from "../src/auth/loginResponse.dto";
import {JwtService} from "@nestjs/jwt";
import {setupApplication} from "../src/setupApplication";


describe('AuthController (e2e)', () => {
    let app: INestApplication<App>;
    let source: DataSource;
    let profile: Profile;
    let user: User;
    let jwtService: JwtService;


    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        setupApplication(app);
        await app.init();
        jwtService = moduleFixture.get(JwtService);

        source = await setupPostgres(true);
        FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
        profile = await FactoryGirl.create<Profile>('Profile');
        user = await source.manager.findOneByOrFail<User>(User, {
            id: profile.user_id
        });
    });

    afterAll(async () => {
        await source.query(`truncate users cascade`);
        await app.close();
        await source.destroy();
    });



    describe('/auth/login (POST)', () => {
        it('should return 401 if user does not exist', async () => {
            const params = {
                username: user.username + 'wrong',
                password: 'password',
            };
            return request(app.getHttpServer())
                .post('/auth/login')
                .send(params)
                .expect(401);

        })
        it('should return 401 if password is incorrect', async () => {
            const params = {
                username: user.username,
                password: 'wrong password',
            };
            return request(app.getHttpServer())
                .post('/auth/login')
                .send(params)
                .expect(401);
        })
        it('should return 200 if user and password are correct', async () => {
            const params = {
                username: user.username,
                password: 'password',
            };
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send(params);
            expect(response.status).toStrictEqual(200);
            const parsedBody = plainToInstance(LoginResponseDto, response.body);
            expect(parsedBody.user.id).toStrictEqual(user.id);
            expect(parsedBody.user.profile.last_name).toStrictEqual(profile.last_name);
            expect(parsedBody.user.profile.first_name).toStrictEqual(profile.first_name);
            const tokenIsValid: Record<string, unknown> = await jwtService.verifyAsync(parsedBody.access_token);
            expect(tokenIsValid).toBeTruthy();
            expect(tokenIsValid['username']).toStrictEqual(user.username);
            expect(tokenIsValid['sub']).toStrictEqual(user.id);
        })
    });

});
