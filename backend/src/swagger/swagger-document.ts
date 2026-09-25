import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  type OpenAPIObject,
  SwaggerModule,
} from '@nestjs/swagger';
import { API_BASE_PATH } from '../config/api-routing';
import { AUTH_BEARER_SECURITY_NAME } from '../modules/auth/constants/auth-token.constants';

export const SWAGGER_TAGS = {
  system: 'System',
  authentication: 'Authentication',
  admins: 'Admin management',
  languages: 'Languages and interface phrases',
  media: 'Media library',
  catalog: 'Product catalog',
  publicApi: 'Public API',
} as const;

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Life Steel API')
    .setDescription('Life Steel catalog and content management API')
    .setVersion('1.0')
    .addServer(API_BASE_PATH)
    .addTag(SWAGGER_TAGS.system)
    .addTag(SWAGGER_TAGS.authentication)
    .addTag(SWAGGER_TAGS.admins)
    .addTag(SWAGGER_TAGS.languages)
    .addTag(SWAGGER_TAGS.media)
    .addTag(SWAGGER_TAGS.catalog)
    .addTag(SWAGGER_TAGS.publicApi)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token returned by an authentication endpoint',
      },
      AUTH_BEARER_SECURITY_NAME,
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    autoTagControllers: false,
  });

  return {
    ...document,
    paths: removeApiBasePath(document.paths),
  };
}

function removeApiBasePath(
  paths: OpenAPIObject['paths'],
): OpenAPIObject['paths'] {
  const displayPaths: OpenAPIObject['paths'] = {};

  for (const [path, pathItem] of Object.entries(paths)) {
    const displayPath = toDisplayPath(path);

    if (displayPaths[displayPath]) {
      throw new Error(`Duplicate Swagger path after normalization: ${path}`);
    }

    displayPaths[displayPath] = pathItem;
  }

  return displayPaths;
}

function toDisplayPath(path: string): string {
  if (path === API_BASE_PATH) {
    return '/';
  }

  if (!path.startsWith(`${API_BASE_PATH}/`)) {
    throw new Error(`Swagger path is outside ${API_BASE_PATH}: ${path}`);
  }

  return path.slice(API_BASE_PATH.length);
}
