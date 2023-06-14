import { FastifyInstance } from 'fastify';

export default async (app: FastifyInstance) => {
  app.get('/users', async (req, res) => {
    // Useful to see page blinking without data
    await new Promise(resolve => setTimeout(resolve, 700));

    res.code(200).send(app.db.users);
  });

  app.get('/users/:id', async (req, res) => {
    // Useful to see page blinking without data
    await new Promise(resolve => setTimeout(resolve, 700));

    const id = Number((req.params as any).id);
    const user = app.db.users.find(user => user.id === id);
    res.code(200).send(user);
  });
};
