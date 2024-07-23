module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/test/setup.ts'],
  modulePathIgnorePatterns: ['/build/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*Interface.ts',
    '!src/test/**',
    '!src/index.ts',
    '!src/app.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  coverageReporters: ['text', 'text-summary', 'html'],
};
