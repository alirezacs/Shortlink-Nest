import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from '../setup/app.factory';
import { loginAsAdmin } from '../helpers/auth.helper';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;

    beforeAll(async () => {
        app = await createTestApp();
        adminToken = await loginAsAdmin(app);
    });

    afterAll(async () => {
        await app.close();
    });

    it('should login successfully as admin', async () => {
        expect(adminToken).toBeDefined();
        expect(typeof adminToken).toBe('string');
        expect(adminToken.length).toBeGreaterThan(0);
    });

    it('should reject invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'WrongPassword',
            })
            .expect(401);
    });

    it('should reject login with an unknown email', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'missing@example.com',
                password: 'Admin@123456',
            })
            .expect(401);
    });

    it('should reject login with invalid payload', async () => {
        const response = await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
                email: 'not-an-email',
                password: 'short',
            })
            .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.statusCode).toBe(400);
    });

    it('should reject login when credentials are missing', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({})
            .expect(400);
    });

    it('should return the authenticated profile on /auth/me', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);

        expect(response.body.email).toBe('admin@example.com');
        expect(response.body).not.toHaveProperty('password');
    });

    it('should reject /auth/me without a bearer token', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .expect(401);
    });

    it('should reject /auth/me with an invalid bearer token', async () => {
        await request(app.getHttpServer())
            .get('/api/v1/auth/me')
            .set('Authorization', 'Bearer not-a-valid-token')
            .expect(401);
    });

    it('should reject register with invalid payload', async () => {
        await request(app.getHttpServer())
            .post('/api/v1/auth/register')
            .send({
                firstName: '',
                email: 'bad',
                password: '123',
            })
            .expect(400);
    });
});
