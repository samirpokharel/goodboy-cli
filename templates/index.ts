import { bold, cyan } from "picocolors";
import type { GetTemplateFileArgs, InstallTemplateArgs } from "./types";
import path from "path";
import { copy } from "../helper/copy";
import pkg from "../package.json";
import fs from "fs/promises";
import os from "os";
import { install } from "../helper/install";

export const getTemplateFile = ({
  template,
  mode,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, template, mode, file);
};

export const installTemple = async ({
  appName,
  eslint,
  isOnline,
  mode,
  packageManager,
  root,
  template,
}: InstallTemplateArgs) => {
  console.log(bold(`Using ${packageManager}.`));
  const templatePath = path.join(__dirname, template, mode);
  const copySource = ["**"];
  if (!eslint) copySource.push("!eslint.config.mjs");
  // TODO: later add for eslint

  await copy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename(name) {
      switch (name) {
        case "gitignore": {
          return `.${name}`;
        }
        case "env": {
          return `.${name}`;
        }
        case "README-template.md": {
          return "README.md";
        }
        default: {
          return name;
        }
      }
    },
  });

  const version = process.env.PRIVATE_TEST_VERSION ?? pkg.version;
  const packageJson: any = {
    name: appName,
    version: "1.0.0",
    main: "server.js",
    scripts: {
      dev: "ts-node-dev --poll server.ts",
      build: "rimraf ./dist && tsc",
      start: "node dist/server.js",
      generate: "prisma generate",
    },
    dependencies: {
      "@prisma/client": "5.19.1",
      "connect-pg-simple": "^10.0.0",
      dotenv: "^16.4.7",
      cors: "^2.8.5",
      express: "^4.19.2",
      yup: "^1.4.0",
    },
    devDependencies: {
      "@types/connect-pg-simple": "^7.0.3",
      "@types/cors": "^2.8.17",
      "@types/express": "^4.17.21",
      prisma: "^5.19.1",
      rimraf: "^6.0.1",
      "ts-node-dev": "^2.0.0",
      typescript: "^5.5.4",
    },
  };

  const devDeps = Object.keys(packageJson.devDependencies).length;
  if (!devDeps) delete packageJson.devDependencies;

  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  console.log("\nInstalling dependencies:");
  for (const dependency in packageJson.dependencies)
    console.log(`- ${cyan(dependency)}`);

  if (devDeps) {
    console.log("\nInstalling devDependencies:");
    for (const dependency in packageJson.devDependencies)
      console.log(`- ${cyan(dependency)}`);
  }
  await install(packageManager, isOnline, ["install"]);
  await install(packageManager, isOnline, ["run", "generate"]);
};
