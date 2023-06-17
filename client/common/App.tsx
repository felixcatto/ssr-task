import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { getApiUrl, routes } from '../../server/lib/sharedUtils.js';
import { IContext, IInitialState } from '../../server/lib/types.js';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';
import { NewSession } from '../pages/session/New.jsx';
import { Todos } from '../pages/todos/Index.jsx';
import { User } from '../pages/users/$id.jsx';
import { Users } from '../pages/users/Index.jsx';

export const App = (props: IInitialState) => {
  const { currentUser, loaderData, pathname } = props;
  const loaderUrl = getApiUrl('loaderData', {}, { url: pathname });

  const axios = originalAxios.create();
  axios.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
  );

  const swrConfig = {
    fetcher: axios.get,
    revalidateOnFocus: false,
    dedupingInterval: 7000,
    fallback: { [loaderUrl]: loaderData },
  };

  const initializedStoreSlice = Object.keys(storeSlice).reduce((acc, key) => {
    const makeFn = storeSlice[key];
    return { ...acc, [key]: makeFn() };
  }, {});

  const globalStoreState = (set, get) => ({
    setGlobalState: set,
    ...makeActions(set, get),
    ...initializedStoreSlice,
    currentUser: storeSlice.currentUser(currentUser),
  });

  const globalStore: any = createStore(immer(globalStoreState));

  const contextStore: IContext = { axios, globalStore };

  return (
    <Context.Provider value={contextStore}>
      <SWRConfig value={swrConfig}>
        <Switch>
          <Route path={routes.home} component={Todos} />
          <Route path={routes.newSession} component={NewSession} />
          <Route path={routes.users} component={Users} />
          <Route path={routes.user} component={User} />
        </Switch>
      </SWRConfig>
    </Context.Provider>
  );
};
