import chalk from "chalk";
import { z } from "zod";

export const DEFAULTS = {
  PORT: 4000,
  BASE_64_ENCODED: false,
  DEFAULT_EVENT_PATH: "./defaultEvent.json"
};

const argSchema = z.object({
  b64: z.boolean().optional().default(DEFAULTS.BASE_64_ENCODED),
  defaultEvent: z.string().optional().default(DEFAULTS.DEFAULT_EVENT_PATH),
  port: z.coerce.number().int().optional().default(DEFAULTS.PORT),
  _: z.array(z.string())
});

/**
 * @param {unknown} args
 */
export const validateArgs = (args) => {
  const argParse = argSchema.safeParse(args);

  if (!argParse.success) {
    console.log(chalk.red("Received invalid command-line arguments:"));
    console.log(argParse.error.issues);
    process.exit(1);
  }

  const safeArgs = argParse.data;

  const filename = safeArgs._[0];
  const possibleExtensions = [".js", ".mjs", ".cjs"];
  if (!filename || !possibleExtensions.some((ext) => filename?.endsWith(ext))) {
    console.log(chalk.red("The filename must have a .js, .mjs or .cjs extension"));
    process.exit(1);
  }

  return {
    ...safeArgs,
    filename
  };
};
