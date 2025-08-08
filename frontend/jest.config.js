module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  globalSetup: "jest-preset-angular/global-setup",
  setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
  moduleFileExtensions: ["ts", "html", "js", "json", "mjs"],
  transform: {
    "^.+\\.(ts|mjs|js|html)$": [
      "jest-preset-angular",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        stringifyContentPathRegex: "\\.(html)$",
      },
    ],
  },
  resolver: "jest-preset-angular/build/resolvers/ng-jest-resolver",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["**/?(*.)+(spec).ts"],
  transformIgnorePatterns: ["node_modules/(?!.*\\.(mjs|ts|js)$)"],
};
