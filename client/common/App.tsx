import originalAxios from 'axios';
import React, { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { Route, Switch } from 'wouter';
import { routes } from '../../server/lib/sharedUtils.js';
import { IContext } from '../../server/lib/types.js';
import { Context } from '../lib/context.jsx';
import { restoreUser, useSetGlobalState } from '../lib/utils.jsx';
import Login from '../pages/session/Login.jsx';
import Todolist from '../pages/todoList/Todolist.jsx';
import { User } from '../pages/users/User.jsx';
import { Users } from '../pages/users/Users.jsx';

export const App = () => {
  const setGlobalState = useSetGlobalState();

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

  const contextStore: IContext = { axios };

  useEffect(() => {
    const initialUserState = restoreUser();
    setGlobalState({ currentUser: initialUserState });
  }, []);

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
