import { FastifyInstance } from 'fastify';
import { IUserLoginSchema } from '../lib/types.js';
import {
  guestUser,
  makeErrors,
  removeSessionCookie,
  setSessionCookie,
  userLoginSchema,
  validate,
} from '../lib/utils.js';

export default async (app: FastifyInstance) => {
  app.get('/session', async req => {
    const { currentUser } = req;
    return { currentUser };
  });

  app.post('/session', { preHandler: validate(userLoginSchema) }, async (req, res) => {
    const data: IUserLoginSchema = req.vlBody;
    const user = app.db.users.find(user => user.name === data.name);

    if (!user) {
      return res.code(400).send(makeErrors({ name: 'User with such name not found' }));
    }

    if (user.password !== data.password) {
      return res.code(400).send(makeErrors({ password: 'Wrong password' }));
    }

    setSessionCookie(res, app.keygrip, user.id);
    res.code(201).send(user);
  });

  app.delete('/session', async (req, res) => {
    removeSessionCookie(res);
    res.code(201).send(guestUser);
  });
};
