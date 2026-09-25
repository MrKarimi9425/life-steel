/** @type {import('jest').Config} */
module.exports = {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'modules/auth/controllers/*.controller.ts',
    'modules/auth/decorators/*.decorator.ts',
    'modules/auth/dto/*.dto.ts',
    'modules/auth/guards/*.guard.ts',
    'modules/auth/services/*.service.ts',
    'modules/catalog/services/catalog.service.ts',
    'modules/admins/services/admins.service.ts',
    'modules/languages/services/languages.service.ts',
    'modules/media/services/*.service.ts',
  ],
  coverageDirectory: '../coverage',
};
