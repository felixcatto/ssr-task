import { loadEnv } from '../../devUtils.js';
import getApp from '../main/index.js';

loadEnv();

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = Number(process.env.NODE_APP_PORT);

const app = getApp();
app.listen({ port, host }, err => {
  if (err) console.log(err);
});
