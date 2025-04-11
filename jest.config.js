/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
  preset: "jest-playwright-preset",
  testMatch: ["**/tests/*.test.js","**/tests/*.test.ts"],
};