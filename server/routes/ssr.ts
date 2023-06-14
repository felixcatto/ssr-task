import { FastifyInstance } from 'fastify';

export const ssrRender = async (app: FastifyInstance) => {
  const { template } = app;

  app.get('/*', async (req, reply) => {
    reply.type('html').send(template);
  });
};
