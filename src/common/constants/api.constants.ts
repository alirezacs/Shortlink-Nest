/**
 * Public HTTP surface of the API.
 *
 * The global prefix and the supported versions live here so `main.ts` and every
 * controller read the same values instead of repeating string literals.
 */

/** Global prefix applied to every route: `/api/...`. */
export const API_PREFIX = 'api';

/**
 * Version 1 of the API, rendered by `VersioningType.URI` as `/api/v1/...`.
 *
 * When a second version is needed, add `API_VERSION_2` next to this constant and
 * pin the new controllers to it. Never repoint `API_VERSION_1`, that is the
 * contract already published to clients.
 */
export const API_VERSION_1 = '1';

/**
 * Mount point of the Swagger UI: `/api/docs`.
 *
 * Swagger is registered straight on the HTTP adapter rather than through the
 * router, so the global prefix is not applied for us and has to be spelled out.
 */
export const API_DOCS_PATH = `${API_PREFIX}/docs`;
