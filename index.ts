#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */

import packageJson from "./package.json";
import { Command } from "commander";
import Conf from "conf";
import prompts from "prompts";
import type { InitialReturnValue } from "prompts";
import { basename, resolve } from "node:path";
import { cyan, green, red, bold } from "picocolors";

import { getPkgManager, PackageManager } from "./helper/get-pkg-manager";
import { validateNpmName } from "./helper/validate-pkg";
import { existsSync } from "node:fs";
import { isFolderEmpty } from "./helper/is-folder-empty";
import { createApp, DownloadError } from "./create-app";


let projectPath: string = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: {
  value: InitialReturnValue;
  aborted: boolean;
  exited: boolean;
}) => {
  if (state.aborted) {
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Command(packageJson.name)
  .version(
    packageJson.version,
    "-v, --version",
    "Output the current version of create-next-app."
  )
  .argument("[directory]")
  .usage("[directory] [options]")
  .helpOption("-h, --help", "Display this help message.")
  // .option("--ts, --typescript", "Initialize as a TypeScript project. (default)")
  // TODO:
  // - add option for Javascript | Typescript
  // - database connection options( Mongodb | Postgress | MySql)
  // - option for RestAPI | GraphQl
  // - Dockarize 

  .option("--eslint", "Initialize with ESLint config.")
  .option("--src-dir", "Initialize inside a 'src/' directory.")
  .option(
    "--use-npm",
    "Explicitly tell the CLI to bootstrap the application using npm."
  )
  .option(
    "--use-pnpm",
    "Explicitly tell the CLI to bootstrap the application using pnpm."
  )
  .option(
    "--use-yarn",
    "Explicitly tell the CLI to bootstrap the application using Yarn."
  )
  .option(
    "--use-bun",
    "Explicitly tell the CLI to bootstrap the application using Bun."
  )
  .option("--yes", "Use saved preferences or defaults for unprovided options.")
  .action((name) => {
    if (name && !name.startsWith("--no-")) {
      projectPath = name;
    }
  })
  .allowUnknownOption()
  .parse(process.argv);

const opts = program.opts();
const { args } = program;

const packageManager: PackageManager = !!opts.useNpm
  ? "npm"
  : !!opts.usePnpm
  ? "pnpm"
  : !!opts.useYarn
  ? "yarn"
  : !!opts.useBun
  ? "bun"
  : getPkgManager();

async function run(): Promise<void> {
  const conf = new Conf({ projectName: "goodboy" });

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your project named?",
      initial: "my-app",
      validate: (name) => {
        const validation = validateNpmName(basename(resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid project name: " + validation.problems[0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the project directory:\n" +
        `  ${cyan(opts.name())} ${green("<project-directory>")}\n` +
        "For example:\n" +
        `  ${cyan(opts.name())} ${green("my-next-app")}\n\n` +
        `Run ${cyan(`${opts.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const appPath = resolve(projectPath);
  const appName = basename(appPath);

  const validation = validateNpmName(appName);
  if (!validation.valid) {
    console.error(
      `Could not create a project called ${red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );

    validation.problems.forEach((p) =>
      console.error(`    ${red(bold("*"))} ${p}`)
    );
    process.exit(1);
  }

  if (opts.example === true) {
    console.error(
      "Please provide an example name or url, otherwise remove the example option."
    );
    process.exit(1);
  }

  if (existsSync(appPath) && !isFolderEmpty(appPath, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;

  /**
   * If the user does not provide the necessary flags, prompt them for their
   * preferences, unless `--yes` option was specified, or when running in CI.
   */
  //   const skipPrompt = ciInfo.isCI || opts.yes;

  try {
    await createApp({
      appPath,
      packageManager,
      typescript: true,
      eslint: opts.eslint,
      srcDir: opts.srcDir,
    });
  } catch (reason) {
    if (!(reason instanceof DownloadError)) {
      throw reason;
    }

    // await createApp({
    //   appPath,
    //   packageManager,
    //   typescript: opts.typescript,
    //   eslint: opts.eslint,
    //   srcDir: opts.srcDir,
    // });
  }
  conf.set("preferences", preferences);
}

run()