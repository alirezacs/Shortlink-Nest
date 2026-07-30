import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from '../setup/app.factory';
import { loginAsAdmin } from '../helpers/auth.helper';

describe('Authentication (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('should login successfully as admin', async () => {
        const token = await loginAsAdmin(app);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
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
});