import { FastifyInstance } from 'fastify';
import { currentUserPlugin, isProduction, loggerPlugin } from '../lib/utils.js';
import session from './session.js';
import { ssrRender } from './ssr.js';
import todos from './todos.js';
import users from './users.js';

export default async (app: FastifyInstance) => {
  app.register(currentUserPlugin);
  app.register(loggerPlugin);

  const controllers = [session, todos, users];
  controllers.forEach(route => app.register(route, { prefix: '/api' }));
  app.all('/api/*', async (req, reply) => reply.code(404).send({ message: 'not found' }));

  if (isProduction(app.mode)) app.register(ssrRender);
};
