import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { setupApplication } from '../src/setupApplication';
import { LoginService } from '../src/auth/login.service';
import {
  FactoryGirlTypeOrmAdapter,
  Profile,
  setupPostgres,
  Task,
  User,
  FactoryGirl,
  TaskPriority,
  TaskStatus,
} from '@sprint-sync/storage';
import * as request from 'supertest';
import { plainToInstance } from 'class-transformer';
import { ListTasksResponseDto } from '../src/task/listTasksResponse.dto';

describe('TaskController (e2e)', () => {
  let app: INestApplication<App>;
  let source: DataSource;
  let user: User;
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
    const profile = await FactoryGirl.create<Profile>('Profile');
    user = await source.manager.findOneByOrFail<User>(User, {
      id: profile.user_id,
    });
    const loginData = await loginService.signIn(user.username, 'password');
    token = loginData.access_token;
  });

  afterAll(async () => {
    await source.query(`truncate users, task cascade`);
    await app.close();
    await source.destroy();
  });

  it('requires authentication for all task routes', async () => {
    const taskId = 1; // Arbitrary ID for test
    await request(app.getHttpServer()).get('/task').expect(401);
    await request(app.getHttpServer()).get(`/task/${taskId}`).expect(401);
    await request(app.getHttpServer()).post('/task').send({}).expect(401);
    await request(app.getHttpServer())
      .put(`/task/${taskId}`)
      .send({})
      .expect(401);
  });

  describe('/task/:id (GET)', () => {
    it('gets task by ID', async () => {
      const task = await FactoryGirl.create<Task>('Task', {
        assigned_to_user_id: user.id,
      });
      const response = await request(app.getHttpServer())
        .get(`/task/${task.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: task.id,
        title: task.title,
      });
    });

    it('returns 404 if task does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/task/9999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('/task/:id (PUT)', () => {
    it('updates a task', async () => {
      const task = await FactoryGirl.create<Task>('Task');
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated Task Description',
        priority: TaskPriority.LOW,
        status: TaskStatus.IN_PROGRESS,
        assigned_to_user_id: user.id,
      };

      const response = await request(app.getHttpServer())
        .put(`/task/${task.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(response.status).toBe(200);
      const updatedTask = await source.manager.findOneOrFail(Task, {
        where: { id: task.id },
      });
      expect(updatedTask.title).toStrictEqual(updates.title);
      expect(updatedTask.description).toStrictEqual(updates.description);
      expect(updatedTask.priority).toStrictEqual(updates.priority);
      expect(updatedTask.status).toStrictEqual(updates.status);
      expect(updatedTask.assigned_to_user_id).toStrictEqual(
        updates.assigned_to_user_id,
      );
    });

    it('forbids assigning a task to another user', async () => {
      const otherUser = await FactoryGirl.create<User>('User');
      const otherUserTask = await FactoryGirl.create<Task>('Task');
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated Task Description',
        priority: TaskPriority.LOW,
        status: TaskStatus.IN_PROGRESS,
        assigned_to_user_id: otherUser.id,
      };

      const response = await request(app.getHttpServer())
        .put(`/task/${otherUserTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updates);

      expect(response.status).toBe(403);
    });

    it('allows admins to update tasks for other users', async () => {
      const task = await FactoryGirl.create<Task>('Task');
      const updates = {
        title: 'Updated Task Title',
        description: 'Updated Task Description',
        priority: TaskPriority.LOW,
        status: TaskStatus.IN_PROGRESS,
        assigned_to_user_id: user.id,
      };
      const admin = await FactoryGirl.create<User>('User', {
        is_admin: true,
      });
      const loginService = app.get(LoginService);
      const loginData = await loginService.signIn(admin.username, 'password');
      const adminToken = loginData.access_token;
      const adminResponse = await request(app.getHttpServer())
        .put(`/task/${task.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates);

      expect(adminResponse.status).toBe(200);
      const updatedTask = await source.manager.findOneOrFail(Task, {
        where: { id: task.id },
      });
      expect(updatedTask.title).toStrictEqual(updates.title);
      expect(updatedTask.description).toStrictEqual(updates.description);
      expect(updatedTask.priority).toStrictEqual(updates.priority);
      expect(updatedTask.status).toStrictEqual(updates.status);
      expect(updatedTask.assigned_to_user_id).toStrictEqual(
        updates.assigned_to_user_id,
      );
    });
  });

  describe('/task (GET)', () => {
    it('gets task list', async () => {
      await FactoryGirl.createMany<Task>('Task', 10, {
        status: TaskStatus.IN_PROGRESS,
      });
      const response = await request(app.getHttpServer())
        .get('/task')
        .set('Authorization', `Bearer ${token}`)
        .query({ pageSize: 5, status: TaskStatus.IN_PROGRESS });
      expect(response.status).toStrictEqual(200);
      const parsedResponse = plainToInstance(
        ListTasksResponseDto,
        response.body,
      );
      expect(parsedResponse.nextPageToken).not.toBeNull();
      expect(parsedResponse.tasks).toHaveLength(5);
    });
  });

  describe('/task (POST)', () => {
    it('creates task', async () => {});
  });
});
