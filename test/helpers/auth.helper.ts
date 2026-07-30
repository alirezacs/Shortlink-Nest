import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export interface AuthResponse {
    accessToken: string;
}

export async function loginAsAdmin(
    app: INestApplication,
): Promise<string> {
    const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
            email: 'admin@example.com',
            password: 'Admin@123456',
        })
        .expect(200);

    const body = response.body as AuthResponse;

    return body.accessToken;
}