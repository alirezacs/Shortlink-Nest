import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_DOCS_PATH } from '../constants/api.constants';

/**
 * Name of the security scheme registered below.
 *
 * `@ApiBearerAuth(JWT_AUTH_SCHEME)` on a controller or handler points at this
 * scheme, which is what ties a route to the Authorize button in the UI. Keeping
 * it in one exported constant avoids the silent mismatch you get when the string
 * is retyped at every call site.
 */
export const JWT_AUTH_SCHEME = 'JWT-auth';

/**
 * Builds the OpenAPI document and mounts the Swagger UI on `/api/docs`.
 *
 * Called from `main.ts` for development only. The document is generated from the
 * already-initialised application, so every controller registered in `AppModule`
 * is discovered automatically, and the global prefix plus the URI version are
 * baked into the emitted paths (`/api/v1/...`).
 */
export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('URL Shortener API')
        .setDescription('REST API documentation for the URL Shortener backend.')
        .setVersion('v1')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
                description:
                    'Paste the `accessToken` returned by POST /api/v1/auth/login. The "Bearer " prefix is added for you.',
            },
            JWT_AUTH_SCHEME,
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(API_DOCS_PATH, app, document, {
        swaggerOptions: {
            // Keeps the entered token across reloads, so the UI does not have to be
            // re-authorised on every change.
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
}
