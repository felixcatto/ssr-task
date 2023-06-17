import { FastifyInstance } from 'fastify';
import path from 'path';
import { getLoaderData } from '../lib/routesLoaders.js';
import { IInitialState, ILoaderDataSchema } from '../lib/types.js';
import { getUrl, loaderDataSchema, validate } from '../lib/utils.js';

export const ssrRender = async (app: FastifyInstance) => {
  const { template, pathPublic } = app;

  app.get('/*', async (req, reply) => {
    const { url, currentUser } = req;

    const loaderData = await getLoaderData({ db: app.db, pathname: url });
    const initialState = { currentUser, loaderData, pathname: url } as IInitialState;

    const serverEntryPath = path.resolve(pathPublic, 'server/entry-server.js');
    const { render } = await import(serverEntryPath);

    const { appHtml, stitchesCss } = render(url, initialState);
    const cssInJsClasses = `<style id="stitches">${stitchesCss}</style></head>`;
    const initialStateScript = `window.INITIAL_STATE = ${JSON.stringify(initialState)}`;

    const html = template
      .replace('<!-- content -->', appHtml)
      .replace('</head>', cssInJsClasses)
      .replace('// script', initialStateScript);

    reply.type('html').send(html);
  });
};

export const loaderData = async (app: FastifyInstance) => {
  app.get(
    getUrl('loaderData'),
    { preHandler: validate(loaderDataSchema, 'query') },
    async (req, reply) => {
      await new Promise(resolve => setTimeout(resolve, 700));
      const { url } = req.vlQuery as ILoaderDataSchema;
      const loaderData = await getLoaderData({ db: app.db, pathname: url });
      reply.send(loaderData);
    }
  );
};
