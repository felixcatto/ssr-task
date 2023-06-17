import cookie from 'cookie';
import fp from 'fastify-plugin';
import * as color from 'kolorist';
import { capitalize, isString } from 'lodash-es';
import path from 'path';
import { fileURLToPath } from 'url';
import * as y from 'yup';
import { guestUser, isAdmin, isSignedIn } from './sharedUtils.js';
import { IAuthenticate, IValidate, IValidateMW } from './types.js';

export { loadEnv } from '../../devUtils.js';
export * from './sharedUtils.js';

export const dirname = url => fileURLToPath(path.dirname(url));

export const getYupErrors = e => {
  if (e.inner) {
    return e.inner.reduce(
      (acc, el) => ({
        ...acc,
        [el.path]: el.message,
      }),
      {}
    );
  }

  return e.message;
};

export const makeErrors = errors => ({ errors });

export const ivalidate: IValidate = (schema, payload, yupOpts = {}) => {
  const { stripUnknown = true } = yupOpts;
  try {
    const validatedPayload = schema.validateSync(payload, {
      abortEarly: false,
      stripUnknown,
    });
    return [validatedPayload, null];
  } catch (e) {
    return [null, { message: 'Input is not valid', errors: getYupErrors(e) }];
  }
};

export const validate: IValidateMW =
  (schema, payloadType = 'body', yupOpts = {}) =>
  async (req, res) => {
    const payload = payloadType === 'query' ? req.query : req.body;

    const [data, error] = ivalidate(schema, payload, yupOpts);
    if (error) {
      res.code(400).send(error);
    } else {
      req[`vl${capitalize(payloadType)}`] = data;
    }
  };

export const sessionName = 'session';
export const composeValue = (value, signature) => `${value}.${signature}`;
export const decomposeValue = compositValue => {
  const values = compositValue.split('.');
  if (values.length !== 2) return [];
  return values;
};

export const setSessionCookie = (res, keygrip, userId) => {
  const cookieValue = String(userId);
  const signature = keygrip.sign(cookieValue);
  res.header(
    'Set-Cookie',
    cookie.serialize(sessionName, composeValue(cookieValue, signature), {
      path: '/',
      httpOnly: true,
    })
  );
};

export const removeSessionCookie = res => {
  res.header(
    'Set-Cookie',
    cookie.serialize(sessionName, '', { path: '/', httpOnly: true, maxAge: 0 })
  );
};

export const checkAdmin = async (req, res) => {
  if (!isAdmin(req.currentUser)) {
    res.code(403).send({ message: 'Forbidden' });
  }
};

export const checkSignedIn = async (req, res) => {
  if (!isSignedIn(req.currentUser)) {
    res.code(401).send({ message: 'Unauthorized' });
  }
};

export const authenticate: IAuthenticate = async (rawCookies, keygrip, fetchUser) => {
  if (!isString(rawCookies)) return [guestUser, false];

  const cookies = cookie.parse(rawCookies);
  const sessionValue = cookies[sessionName];
  if (!sessionValue) return [guestUser, false];

  const [userId, signature] = decomposeValue(sessionValue);
  if (!userId || !signature) return [guestUser, true];

  const isSignatureCorrect = keygrip.verify(userId, signature);
  if (!isSignatureCorrect) return [guestUser, true];

  const user = await fetchUser(userId);
  if (!user) return [guestUser, true];

  return [user, false];
};

export const currentUserPlugin = fp(async app => {
  const { keygrip, db } = app;
  const fetchUser = async userId => db.users.find(user => user.id === Number(userId));

  app.addHook('onRequest', async (req, res) => {
    const rawCookies = req.headers.cookie;
    const [currentUser, shouldRemoveSession] = await authenticate(rawCookies, keygrip, fetchUser);

    if (shouldRemoveSession) removeSessionCookie(res);

    req.currentUser = currentUser;
  });
});

export const loggerPlugin = fp(async app => {
  const supportsArt = color.options.supportLevel === 2;
  const icons = { req: supportsArt ? '←' : '<', res: supportsArt ? '→' : '>' };
  const logResponseTime = true;

  app.addHook('onRequest', async request => {
    const proxyIp = request.headers['x-forwarded-for'];
    const ip = isString(proxyIp) ? proxyIp : request.ip;

    request.log.info(
      `${color.bold(color.blue(icons.req))}${color.blue(request.method)}:${color.green(
        request.url
      )} ${color.white('from ip')} ${color.blue(ip)}`
    );
  });

  app.addHook('onResponse', async (request, reply) => {
    const secFetchDest = request.headers['sec-fetch-dest'];
    const resourceType = isString(secFetchDest) ? secFetchDest : 'other';
    const isUserScript = ['script', 'font', 'image'].includes(resourceType);
    const isNodeScript = request.url.startsWith('/node_modules/');
    if (isUserScript || isNodeScript) return;

    request.log.info(
      `${color.bold(color.magenta(icons.res))}${color.magenta(request.method)}:${color.green(
        request.url
      )} ${color.white('status')} ${color.magenta(reply.statusCode)}${
        logResponseTime
          ? `${color.white(', took')} ${color.magenta(
              Math.round(reply.getResponseTime())
            )}${color.magenta('ms')}`
          : ''
      }`
    );
  });
});

export const loggerOptions = {
  disableRequestLogging: true,
  logger: {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:HH:MM:ss', ignore: 'reqId,pid,hostname' },
    },
  },
};

export const userLoginSchema = y.object({
  name: y.string().required('required'),
  password: y.string().required('required'),
});

export const todoPostGuestSchema = y.object({
  text: y.string().required('required'),
  name: y.string().required('required'),
  email: y.string().email().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoPostUserSchema = y.object({
  text: y.string().required('required'),
  is_completed: y.boolean().default(false),
});

export const todoPutSchema = y.object({
  text: y.string().required('required'),
  is_completed: y.boolean(),
});

export const loaderDataSchema = y.object({
  url: y.string().required(),
});
