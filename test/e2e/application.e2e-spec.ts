import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { createTestApp } from '../setup/app.factory';

describe('Application (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should bootstrap the application', async () => {
    const server = app.getHttpServer();

    expect(server).toBeDefined();
  });

  it('should return 404 for unknown route', async () => {
    await request(app.getHttpServer())
      .get('/this-route-does-not-exist')
      .expect(404);
  });
});