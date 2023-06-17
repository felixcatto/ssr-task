import axios from 'axios';
import express from 'express';
import proxy from 'express-http-proxy';
import fs from 'fs';
import path from 'path';
import { createServer } from 'vite';
import { IInitialState } from '../lib/types.js';
import { dirname, getApiUrl } from '../lib/utils.js';

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
      const axiosOptions = { baseURL: nodeAppUrl, headers: req.headers };

      const [session, loaderData] = await Promise.all([
        axios.get(getApiUrl('session'), axiosOptions),
        axios.get(getApiUrl('loaderData', {}, { url }), axiosOptions),
      ]);

      const initialState = {
        currentUser: session.data.currentUser,
        loaderData: loaderData.data,
        pathname: url,
      } as IInitialState;

      const template = await vite.transformIndexHtml(url, rawTemplate);
      const { render } = await vite.ssrLoadModule('/client/main/entry-server.tsx');

      const { appHtml, stitchesCss } = render(url, initialState);
      const cssInJsScript = `window.stitchesCss = \`${stitchesCss}\`;`;
      const initialStateScript = `window.INITIAL_STATE = ${JSON.stringify(initialState)}`;
      const script = cssInJsScript.concat(initialStateScript);

      const html = template
        .replace('<!-- content -->', appHtml)
        .replace('// script', script)
        .replace('<body>', '<body style="display: none">'); // avoid FOUC in dev mode

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  return app;
};
