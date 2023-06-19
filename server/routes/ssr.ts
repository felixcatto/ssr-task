import { FastifyInstance } from 'fastify';
import path from 'path';

export const ssrRender = async (app: FastifyInstance) => {
  const { template, pathPublic } = app;

  app.get('/*', async (req, reply) => {
    const { url, currentUser } = req;
    const initialState = { currentUser };
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
