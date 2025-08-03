import { afterEach, beforeEach, describe, it, expect, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import {FactoryGirl, FactoryGirlTypeOrmAdapter, setupPostgres, User} from "@sprint-sync/storage";
import {login} from "../../src";



describe('login', () => {
    let source: DataSource;
    let user: User;

    beforeEach(async () => {
        source = await setupPostgres(true);
        FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
        user = await FactoryGirl.create<User>('User');
    });
    afterEach(async () => {
        await source.query(`truncate users cascade`);
    });
    afterAll(async () => {
        await source.destroy();
    });

    it('should return user with correct password', async () => {
        const retrievedUser = await login(source.manager, user.username, 'password');
        expect(retrievedUser).not.toBeNull()
    });
    it('should return null with incorrect password', async () => {
        const retrievedUser = await login(source.manager, user.username, 'wrong password');
        expect(retrievedUser).toBeNull();
    })
})