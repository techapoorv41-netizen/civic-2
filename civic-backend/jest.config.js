module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/env.js"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  verbose: true,
  testTimeout: 35000,
  clearMocks: true,
  restoreMocks: true,
};
