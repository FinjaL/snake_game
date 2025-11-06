module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};
