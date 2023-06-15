import express from 'express';
import proxy from 'express-http-proxy';
import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';
import { dirname } from '../lib/utils.js';

export const getViteDevServer = async () => {
  const __dirname = dirname(import.meta.url);
  const templatePath = path.resolve(__dirname, '../../index.html');
  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');
  const nodeAppUrl = `http://localhost:${process.env.NODE_APP_PORT}`;

  const app = express();

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use('/api', proxy(nodeAppUrl, { proxyReqPathResolver: req => `/api${req.url}` }));
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, rawTemplate);
      const { render } = await vite.ssrLoadModule('/client/main/entry-server.tsx');

      const { appHtml, stitchesCss } = render(url);
      const cssInJsClasses = `window.stitchesCss = \`${stitchesCss}\``;

      const html = template
        .replace('<!-- content -->', appHtml)
        .replace('// script', cssInJsClasses)
        .replace('<body>', '<body style="display: none">'); // avoid FOUC in dev mode

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return app;
};
