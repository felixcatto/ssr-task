import { isEmpty } from 'lodash-es';
import { compile, match } from 'path-to-regexp';
import { IGetGenericRouteByHref, IMakeEnum, IMakeUrlFor } from './types.js';

export const qs = {
  stringify: (obj = {}) => {
    if (isEmpty(obj)) return '';
    return Object.keys(obj)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },
};

export const makeUrlFor: IMakeUrlFor = rawRoutes => {
  const routes = Object.keys(rawRoutes).reduce(
    (acc, name) => ({ ...acc, [name]: compile(rawRoutes[name]) }),
    {} as any
  );

  return (name, routeParams = {}, query = {}) => {
    const toPath = routes[name];
    return isEmpty(query) ? toPath(routeParams) : `${toPath(routeParams)}?${qs.stringify(query)}`;
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
  loaderData: '/loader-data',
} as const;

export const getUrl = makeUrlFor(routes);

export const getApiUrl = (name: keyof typeof routes, routeParams?, query?) =>
  `/api${getUrl(name, routeParams, query)}`;

export const routesWithLoaders = [routes.home, routes.users, routes.user] as const;

export const getGenericRouteByHref: IGetGenericRouteByHref = href => {
  let matchedRoute = null as any;
  const genericRoutes = routesWithLoaders;

  for (let i = 0; i < genericRoutes.length; i++) {
    const genericRoute = genericRoutes[i];
    const isMatched = match(genericRoute)(href);
    if (isMatched) {
      matchedRoute = { url: genericRoute, params: isMatched.params };
      break;
    }
  }

  return matchedRoute;
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
