/// <reference types="vite/client" />
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FormikHelpers } from 'formik';
import { Draft } from 'immer';
import * as y from 'yup';
import { StoreApi } from 'zustand';
import makeActions from '../../client/globalStore/actions.js';
import { storeSlice } from '../../client/globalStore/store.js';
import {
  asyncStates,
  loaderDataSchema,
  roles,
  todoPostGuestSchema,
  todoPostUserSchema,
  todoPutSchema,
  userLoginSchema,
} from './utils.js';

export type IAnyObj = {
  [key: string]: any;
};

export type IAnyFn = (...args: any) => any;

export type IMakeEnum = <T extends ReadonlyArray<string>>(
  ...args: T
) => { [key in T[number]]: key };

export type IMakeUrlFor = <T extends object>(
  rawRoutes: T
) => (name: keyof T, args?, opts?) => string;

export type IRole = keyof typeof roles;
export type IAsyncState = keyof typeof asyncStates;

export type IMode = 'test' | 'development' | 'production';

export type IUser = {
  id: number;
  name: string;
  role: IRole;
  email: string;
  password: string;
};
export type IUserLoginSchema = y.InferType<typeof userLoginSchema>;

export type IUserLoginCreds = {
  email: string;
  password: string;
};

export type ITodo = {
  id: number;
  text: string;
  is_completed: boolean;
  name: string;
  email: string;
};
export type ITodoPostGuestSchema = y.InferType<typeof todoPostGuestSchema>;
export type ITodoPostUserSchema = y.InferType<typeof todoPostUserSchema>;
export type ITodoPutSchema = y.InferType<typeof todoPutSchema>;

export interface IAxiosInstance extends AxiosInstance {
  request<T = any, R = T, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  head<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  options<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
}

export type IDb = {
  users: IUser[];
  todos: ITodo[];
};

declare module 'fastify' {
  interface FastifyInstance {
    db: IDb;
    mode: IMode;
    keygrip: any;
    template: string;
    pathPublic: string;
    vite: any;
  }
  interface FastifyRequest {
    vlBody: any;
    vlQuery: any;
    currentUser: IUser;
  }
}

export type IApiErrors = {
  apiErrors: any;
  setApiErrors: any;
};

export type IYupError = {
  message: string;
  errors: IAnyObj;
};

export type IAuthenticate = (
  rawCookies,
  keygrip,
  fetchUser: (id) => Promise<IUser | undefined>
) => Promise<[currentUser: IUser, shouldRemoveSession: boolean]>;

type IYupOpts = {
  stripUnknown?: boolean;
};
export type IValidate = <T = any>(
  schema,
  payload,
  yupOpts?: IYupOpts
) => [data: T, error: null] | [data: null, error: IYupError];
export type IPayloadTypes = 'query' | 'body';
export type IValidateMW = (
  schema,
  payloadType?: IPayloadTypes,
  yupOpts?: IYupOpts
) => (req, res) => any;

type IRawStoreSlice = typeof storeSlice;
export type IStoreSlice = {
  [key in keyof IRawStoreSlice]: ReturnType<IRawStoreSlice[key]>;
};

export type IActions = ReturnType<typeof makeActions>;

type ISetStateUpdateFn = (state: Draft<IStoreSlice>) => Partial<IStoreSlice> | void;
export type ISetGlobalState = (arg: Partial<IStoreSlice> | ISetStateUpdateFn) => void;
export type IGetGlobalState = () => IStoreSlice & IActions;

export type IStore = IStoreSlice & IActions & { setGlobalState: ISetGlobalState };

export type IUseStore = <T>(selector: (state: IStore) => T) => T;

export type IContext = {
  axios: IAxiosInstance;
  globalStore: StoreApi<IStore>;
};

export type IOnSubmit = (values, actions: FormikHelpers<any>) => Promise<any>;
export type IUseSubmit = (onSubmit: IOnSubmit) => IOnSubmit;

type INotificationText = { text: string; component?: undefined };
type INotificationComponent = {
  text?: undefined;
  component: () => JSX.Element;
};
export type INotification = {
  id: string;
  title: string;
  isHidden: boolean;
  isInverseAnimation: boolean;
  autoremoveTimeout: number | null;
} & (INotificationText | INotificationComponent);

type IMakeNotificationOpts = {
  title: INotification['title'];
  autoremoveTimeout?: INotification['autoremoveTimeout'];
} & (INotificationText | INotificationComponent);
export type IMakeNotification = (opts: IMakeNotificationOpts) => INotification;

export type IInitialState = {
  currentUser: IUser;
  loaderData: IAnyObj;
  pathname: string;
};

declare global {
  interface Window {
    stitchesCss: string;
    INITIAL_STATE: IInitialState;
  }
}

export type IGetGenericRouteByHref = (href: string) => { url: string; params: object } | null;

export type ILoaderDataSchema = y.InferType<typeof loaderDataSchema>;
