/** @type {import('ts-jest').JestConfigWithTsJest} **/
const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/", "src"],
  testEnvironment: "jsdom", // Ensure this is set to "jsdom"
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
