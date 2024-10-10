export default {
  testEnvironment: "node",
  transform: {},
  setupFilesAfterEnv: ["./jest.setup.cjs"],
  globalSetup: "./__tests__/globalSetup.mjs",
  globalTeardown: "./__tests__/globalTeardown.mjs",
  testTimeout: 30000,
  maxWorkers: 1,
};
