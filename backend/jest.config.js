module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.js", "!src/**/*.test.js", "!src/**/index.js"],
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  setupFilesAfterEnv: [],
};
