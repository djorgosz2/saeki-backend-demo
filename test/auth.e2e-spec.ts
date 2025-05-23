import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should authenticate admin user successfully', () => {
      return request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@admin.com',
          password: 'adminpassword',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('tokenExpires');
          expect(response.body).toHaveProperty('user');
          expect(response.body.user).toHaveProperty('email', 'admin@admin.com');
        });
    });

    it('should authenticate regular user successfully', () => {
      return request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@user.com',
          password: 'userpassword',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('tokenExpires');
          expect(response.body).toHaveProperty('user');
          expect(response.body.user).toHaveProperty('email', 'user@user.com');
        });
    });

    it('should fail with invalid credentials', () => {
      return request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'non@existing.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with invalid email format', () => {
      return request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notanemail',
          password: 'somepassword',
        })
        .expect(422)
        .expect((response) => {
          expect(response.body).toHaveProperty('errors');
          expect(response.body.errors).toHaveProperty('email');
          expect(response.body.errors.email).toContain(
            'email must be an email',
          );
        });
    });
    it('should fail with invalid password format', () => {
      return request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'non@existing.com',
          password: 'short',
        })
        .expect(422)
        .expect((response) => {
          expect(response.body).toHaveProperty('errors');
          expect(response.body.errors).toHaveProperty('password');
          expect(response.body.errors.password).toContain(
            'password must be longer than or equal to 6 characters',
          );
        });
    });
  });

  describe('GET /auth/me', () => {
    let adminToken: string;

    beforeAll(async () => {
      const response = await request
        .default(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@admin.com',
          password: 'adminpassword',
        });
      adminToken = response.body.token;
    });

    it('should get user profile with valid token', () => {
      return request
        .default(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((response) => {
          expect(response.body.user).toHaveProperty('id');
          expect(response.body.user).toHaveProperty('email', 'admin@admin.com');
        });
    });

    it('should fail without token', () => {
      return request.default(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request
        .default(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)
        .expect((response) => {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('Unauthorized');
        });
    });
  });
});
