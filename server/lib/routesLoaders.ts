import { IAnyObj, IDb } from './types.js';
import { getGenericRouteByHref, routes, routesWithLoaders } from './utils.js';

type IOpts = {
  pathname: string;
  params: IAnyObj;
  db: IDb;
};

type ILoaderOpts = Omit<IOpts, 'params'>;

type IRouteLoaders = {
  [key in (typeof routesWithLoaders)[number]]: (opts: IOpts) => any;
};

export const getLoaderData = async (opts: ILoaderOpts) => {
  const { pathname } = opts;
  const genericRoute = getGenericRouteByHref(pathname);
  if (!genericRoute) return {};

  const loadRouteData = routeLoaders[genericRoute.url];
  if (!loadRouteData) return {};

  return loadRouteData({ ...opts, params: genericRoute.params });
};

const routeLoaders: IRouteLoaders = {
  [routes.home]: async opts => {
    return { todos: opts.db.todos };
  },

  [routes.users]: async opts => {
    return { users: opts.db.users };
  },

  [routes.user]: async opts => {
    const id = Number(opts.params.id);
    const user = opts.db.users.find(user => user.id === id);
    return { user };
  },
};
