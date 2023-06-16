import { FastifyInstance } from 'fastify';
import path from 'path';

export const ssrRender = async (app: FastifyInstance) => {
  const { template, pathPublic } = app;

  app.get('/*', async (req, reply) => {
    const { url } = req;
    const serverEntryPath = path.resolve(pathPublic, 'server/entry-server.js');
    const { render } = await import(serverEntryPath);

    const { appHtml, stitchesCss } = render(url);
    const cssInJsClasses = `<style id="stitches">${stitchesCss}</style></head>`;

    const html = template.replace('<!-- content -->', appHtml).replace('</head>', cssInJsClasses);
    reply.type('html').send(html);
  });
};
