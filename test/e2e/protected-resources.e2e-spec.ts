import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from '../setup/app.factory';
import { loginAsAdmin } from '../helpers/auth.helper';

describe('Protected resources (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authorization', () => {
    it('rejects users list without a token', async () => {
      await request(app.getHttpServer()).get('/api/v1/users').expect(401);
    });

    it('rejects users list with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('users', () => {
    it('lists users for an authorized admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: expect.any(Number),
        total: expect.any(Number),
      });
    });

    it('rejects invalid user query params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users')
        .query({ page: 0, limitBy: 'password' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('returns 404 for an unknown user id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/3f2504e0-4f89-11d3-9a0c-0305e82c3301')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('roles', () => {
    it('lists roles for an authorized admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toBeDefined();
    });

    it('returns 404 for an unknown role id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/roles/3f2504e0-4f89-11d3-9a0c-0305e82c3301')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('permissions', () => {
    it('lists permissions for an authorized admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('lists permission groups', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('settings', () => {
    it('lists settings for an authorized admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('lists setting categories for an authorized admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/settings/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns 404 for an unknown setting id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settings/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('rejects invalid setting create payloads', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: '', value: null })
        .expect(400);
    });
  });
});
