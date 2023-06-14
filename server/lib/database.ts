const users = [
  {
    id: -1,
    name: 'Vasa',
    role: 'admin',
    email: 'vasa@yandex.ru',
    password: '1',
  },
  {
    id: -2,
    name: 'Fedya',
    role: 'user',
    email: 'user@unknown.ru',
    password: '1',
  },
  {
    id: -3,
    name: 'Ryan Florence',
    role: 'user',
    email: 'ryanF@gmail.com',
    password: '1',
  },
  {
    id: -4,
    name: 'Sarah Dayan',
    role: 'user',
    email: 'sarahD@gmail.com',
    password: '1',
  },
  {
    id: -5,
    name: 'admin',
    role: 'admin',
    email: 'admin@gmail.com',
    password: '1',
  },
];

const todos = [
  {
    id: -10,
    text: 'Closure',
    is_completed: false,
    name: 'Vasa',
    email: 'vasa@yandex.ru',
  },
  {
    id: -9,
    text: 'Polymer',
    is_completed: false,
    name: 'Sarah Dayan',
    email: 'sarahD@gmail.com',
  },
  {
    id: -8,
    text: 'Elixir',
    is_completed: false,
    name: 'Ryan Florence',
    email: 'ryanF@gmail.com',
  },

  {
    id: -7,
    text: 'Backbone.js',
    is_completed: true,
    name: 'Vasa',
    email: 'vasa@yandex.ru',
  },
  {
    id: -6,
    text: 'yet another todo',
    is_completed: true,
    name: 'Fedya',
    email: 'user@unknown.ru',
  },
  {
    id: -5,
    text: 'Tailwind CSS ... It’s easy to customize, adapts to any design, and the build size is tiny.',
    is_completed: false,
    name: 'Sarah Dayan',
    email: 'sarahD@gmail.com',
  },
  {
    id: -4,
    text: 'I feel like an idiot for not using Tailwind CSS until now',
    is_completed: false,
    name: 'Ryan Florence',
    email: 'ryanF@gmail.com',
  },
  {
    id: -3,
    text: 'guest todo',
    is_completed: false,
    name: 'Fedya',
    email: 'user@unknown.ru',
  },
  {
    id: -2,
    text: 'Todo, todo, ..., todo?',
    is_completed: true,
    name: 'Vasa',
    email: 'vasa@yandex.ru',
  },
  {
    id: -1,
    text: 'Inverse todo',
    is_completed: false,
    name: 'Vasa',
    email: 'vasa@yandex.ru',
  },
];

export const db = {
  users,
  todos,
};
