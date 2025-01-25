import { mkdirSync } from "node:fs";
import type { PackageManager } from "./helper/get-pkg-manager";
import { isWriteable } from "./helper/is-writeable";
import type { TemplateMode, TemplateType } from "./templates/types";
import { basename, dirname, join, resolve } from "node:path";
import { isFolderEmpty } from "./helper/is-folder-empty";
import { cyan, green } from "picocolors";
import { installTemple } from "./templates";
import { getOnline } from "./helper/is-online";
import { tryGitInit } from "./helper/git";

export class DownloadError extends Error {}

export async function createApp({
  appPath,
  packageManager,
  typescript,
  eslint,
  srcDir,
}: {
  appPath: string;
  packageManager: PackageManager;
  typescript: boolean;
  srcDir: boolean;
  eslint: boolean;
}) {
  const mode: TemplateMode = typescript ? "ts" : "js";
  const template: TemplateType = "default";
  const root = resolve(appPath);

  if (!(await isWriteable(dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = basename(root);
  mkdirSync(root, { recursive: true });
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }
  const useYarn = packageManager === "yarn";
  const isOnline = !useYarn || (await getOnline());
  const originalDirectory = process.cwd();
  console.log(`Creating a new Next.js app in ${green(root)}.`);
  console.log();
  process.chdir(root);
  const packageJsonPath = join(root, "package.json");
  let hasPackageJson = false;

  await installTemple({
    appName,
    root,
    template,
    packageManager,
    isOnline,
    eslint,
    mode,
    srcDir,
  });
  await tryGitInit(root);
  console.log("Initialized a git repository.");
  console.log();

  let cdpath: string;
  if (join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log(`${green("Success!")} Created ${appName} at ${appPath}`);

  if (hasPackageJson) {
    console.log("Inside that directory, you can run several commands:");
    // console.log();
    // console.log(cyan(`  ${packageManager} ${useYarn ? "" : "run "}generate`));
    // console.log("    Generate the prisma client");

    console.log();

    console.log(cyan(`docker-compose -f dev.docker-compose.yml up`));
    console.log("   Start Developmentn Servier using docker compose");
    
    console.log();
    console.log(cyan(`  ${packageManager} ${useYarn ? "" : "run "}dev`));
    console.log("    Starts the development server.");
    console.log();
    console.log(cyan(`  ${packageManager} ${useYarn ? "" : "run "}build`));
    console.log("    Builds the app for production.");
    console.log();
    console.log(cyan(`  ${packageManager} start`));
    console.log("    Runs the built app in production mode.");
    console.log();
    console.log("We suggest that you begin by typing:");
    console.log();
    console.log(cyan("  cd"), cdpath);
    console.log(`  ${cyan(`${packageManager} ${useYarn ? "" : "run "}dev`)}`);
  }
}
