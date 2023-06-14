import { FastifyInstance } from 'fastify';
import { uniqueId } from 'lodash-es';
import { ITodo, ITodoPostGuestSchema, ITodoPostUserSchema, ITodoPutSchema } from '../lib/types.js';
import {
  checkAdmin,
  isSignedIn,
  ivalidate,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoPutSchema,
  validate,
} from '../lib/utils.js';

export default async (app: FastifyInstance) => {
  app.get('/todos', async (req, res) => {
    // Useful to see page blinking without data
    await new Promise(resolve => setTimeout(resolve, 700));

    res.code(200).send(app.db.todos);
  });

  app.post('/todos', async (req, res) => {
    const { db } = app;
    const { currentUser } = req;
    const isUserSignedIn = isSignedIn(req.currentUser);
    const [data, error] = isUserSignedIn
      ? ivalidate<ITodoPostUserSchema>(todoPostUserSchema, req.body)
      : ivalidate<ITodoPostGuestSchema>(todoPostGuestSchema, req.body);

    if (error) {
      return res.code(400).send(error);
    }

    const id = Number(uniqueId());
    let todo: ITodo;
    if (isUserSignedIn) {
      const { name, email } = currentUser;
      todo = { ...data, name, email, id };
    } else {
      todo = { ...(data as ITodoPostGuestSchema), id };
    }

    const newTodos = db.todos.concat(todo);
    app.db.todos = newTodos;

    res.code(201).send(todo);
  });

  app.put('/todos/:id', { preHandler: [checkAdmin, validate(todoPutSchema)] }, async (req, res) => {
    const { db } = app;
    const id = Number((req.params as any).id);
    const data: ITodoPutSchema = req.vlBody;
    const oldTodo = db.todos.find(todo => todo.id === id);
    if (!oldTodo) {
      return res.code(400).send({ message: 'Entity does not exist' });
    }

    const oldTodoIndex = db.todos.findIndex(todo => todo.id === id);
    db.todos[oldTodoIndex] = { ...oldTodo, ...data };

    res.code(201).send(id);
  });

  app.delete('/todos/:id', { preHandler: checkAdmin }, async (req, res) => {
    const { db } = app;
    const id = Number((req.params as any).id);

    const newTodos = db.todos.filter(todo => todo.id !== id);
    app.db.todos = newTodos;

    res.code(201).send({});
  });
};
