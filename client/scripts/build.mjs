import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

process.env.NEXT_DIST_DIR ??= ".next-build";

const require = createRequire(import.meta.url);
const configModulePath = require.resolve("next/dist/server/config");
const configModule = require(configModulePath);
const distDir = process.env.NEXT_DIST_DIR;
const pagesManifestPath = path.join(
  process.cwd(),
  distDir,
  "server",
  "pages-manifest.json"
);
const buildIdPath = path.join(process.cwd(), distDir, "BUILD_ID");

const originalReadFile = fs.promises.readFile.bind(fs.promises);
fs.promises.readFile = async (targetPath, ...args) => {
  if (targetPath === pagesManifestPath) {
    try {
      return await originalReadFile(targetPath, ...args);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return "{}";
      }
      throw error;
    }
  }

  if (targetPath === buildIdPath) {
    try {
      return await originalReadFile(targetPath, ...args);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        return "kinmel-client";
      }
      throw error;
    }
  }

  return originalReadFile(targetPath, ...args);
};

require.cache[configModulePath].exports = {
  __esModule: true,
  ...configModule,
  default: async (...args) => {
    const config = await configModule.default(...args);

    if (!config.distDir) {
      config.distDir = distDir;
    }

    if (typeof config.generateBuildId !== "function") {
      config.generateBuildId = async () => "kinmel-client";
    }

    return config;
  },
};

const nextBuildModule = require("next/dist/build/index.js");
const nextBuild = nextBuildModule.default;

nextBuild(process.cwd())
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
