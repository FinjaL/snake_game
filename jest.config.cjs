module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/state.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)',
  ],
  moduleNameMapper: {
    '^\\.(jpg|jpeg|png|gif|webp|svg|mp3|wav)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};