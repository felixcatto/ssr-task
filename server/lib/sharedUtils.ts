import { compile } from 'path-to-regexp';
import { IMakeEnum, IMakeUrlFor } from './types.js';

export const makeUrlFor: IMakeUrlFor = rawRoutes => {
  const routes = Object.keys(rawRoutes).reduce(
    (acc, name) => ({ ...acc, [name]: compile(rawRoutes[name]) }),
    {} as any
  );

  return (name, routeParams = {}) => {
    const toPath = routes[name];
    return toPath(routeParams);
  };
};

export const routes = {
  home: '/',
  users: '/users',
  user: '/users/:id',
  todos: '/todos',
  todo: '/todos/:id',
  session: '/session',
  newSession: '/session/new',
} as const;

export const getUrl = makeUrlFor(routes);

export const getApiUrl = (name: keyof typeof routes, routeParams?) => {
  const { protocol, hostname } = window.location;
  const port = import.meta.env.VITE_NODE_APP_PORT;
  const url = getUrl(name, routeParams);
  return `${protocol}//${hostname}:${port}/api${url}`;
};

export const makeEnum: IMakeEnum = (...args) =>
  args.reduce((acc, key) => ({ ...acc, [key]: key }), {} as any);

export const roles = makeEnum('user', 'admin', 'guest');
export const asyncStates = makeEnum('idle', 'pending', 'resolved', 'rejected');
export const modes = makeEnum('test', 'development', 'production');

export const guestUser = {
  id: -111,
  name: 'Guest',
  role: roles.guest,
  email: '',
  password: '',
} as const;

export const isSignedIn = currentUser => currentUser.role !== roles.guest;
export const isAdmin = currentUser => currentUser.role === roles.admin;

export const isDevelopment = mode => mode === modes.development;
export const isProduction = mode => mode === modes.production;
