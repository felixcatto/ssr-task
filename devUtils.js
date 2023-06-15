import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { existsSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const dirname = url => fileURLToPath(path.dirname(url));

export const loadEnv = () => {
  const mode = process.env.NODE_ENV || 'development';
  const __dirname = dirname(import.meta.url);
  const envLocalFilePath = path.resolve(__dirname, `.env.local`);
  const envModeFilePath = path.resolve(__dirname, `.env.${mode}`);
  const isEnvLocalFileExists = existsSync(envLocalFilePath);
  const isEnvModeFileExists = existsSync(envModeFilePath);

  if (isEnvLocalFileExists) {
    console.log(`Loaded env from ${envLocalFilePath}`);
    const env = dotenv.config({ path: envLocalFilePath });
    dotenvExpand.expand(env);
  }

  if (isEnvModeFileExists) {
    console.log(`Loaded env from ${envModeFilePath}`);
    const env = dotenv.config({ path: envModeFilePath });
    dotenvExpand.expand(env);
  }

  if (!isEnvLocalFileExists && !isEnvModeFileExists) {
    console.log(`No env files found :(`);
  }
};
