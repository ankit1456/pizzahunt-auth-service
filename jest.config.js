/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 7000,
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!tests/**',
    '!**/node_modules/**',
    '!src/migration/**'
  ],
  moduleNameMapper: {
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@middlewares(.*)$': '<rootDir>/src/middlewares$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '^@validators(.*)$': '<rootDir>/src/validators$1',
    '^@entity(.*)$': '<rootDir>/src/entity$1',
    '^@customTypes(.*)$': '<rootDir>/src/customTypes$1',
    '^@src/(.*)$': '<rootDir>/src/$1'
  }
};
