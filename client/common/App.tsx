import originalAxios from 'axios';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { routes } from '../../server/lib/sharedUtils.js';
import { IAppProps, IContext } from '../../server/lib/types.js';
import makeActions from '../globalStore/actions.js';
import { storeSlice } from '../globalStore/store.js';
import { Context } from '../lib/context.jsx';
import Login from '../pages/session/Login.jsx';
import Todolist from '../pages/todoList/Todolist.jsx';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.jsx';

export const App = (props: IAppProps) => {
  const { currentUser } = props;

  const axios = originalAxios.create();
  axios.interceptors.response.use(
    response => response.data,
    error => Promise.reject(error)
  );

  const swrConfig = {
    fetcher: axios.get,
    revalidateOnFocus: false,
    dedupingInterval: 7000,
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
          <Route path={routes.home} component={Todolist} />
          <Route path={routes.newSession} component={Login} />
          <Route path={routes.users} component={Users} />
          <Route path={routes.user} component={User} />
        </Switch>
      </SWRConfig>
    </Context.Provider>
  );
};
