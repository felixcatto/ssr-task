import fastifyStatic from '@fastify/static';
import fastify from 'fastify';
import fs from 'fs';
import makeKeygrip from 'keygrip';
import path from 'path';
import { db } from '../lib/database.js';
import {
  corsOptions,
  dirname,
  isDevelopment,
  isProduction,
  loggerOptions,
  modes,
} from '../lib/utils.js';
import routes from '../routes/index.js';

const getApp = () => {
  const mode = process.env.NODE_ENV;
  const keys = process.env.KEYS!.split(',');
  const keygrip = makeKeygrip(keys);
  const __dirname = dirname(import.meta.url);
  const pathPublic = path.resolve(__dirname, '../public');

  const app = fastify(loggerOptions);

  let templatePath;
  switch (mode) {
    case modes.production:
      templatePath = path.resolve(pathPublic, 'index.html');
      break;
    case modes.development:
      templatePath = path.resolve(__dirname, '../../index.html');
      break;
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  app.decorate('db', db);
  app.decorate('mode', mode);
  app.decorate('keygrip', keygrip);
  app.decorate('template', template);
  app.decorate('pathPublic', pathPublic);
  app.decorateRequest('vlBody', null);
  app.decorateRequest('currentUser', null);

  if (isProduction(mode)) {
    app.register(fastifyStatic, { root: pathPublic, wildcard: false, index: false });
  }

  app.register(routes);

  return app;
};

export default getApp;
