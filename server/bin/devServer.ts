import * as color from 'kolorist';
import { loadEnv } from '../../devUtils.js';
import { getViteDevServer } from '../main/devServer.js';

loadEnv();

getViteDevServer().then(viteDevServer => {
  const port = Number(process.env.DEV_SERVER_PORT);
  viteDevServer.listen(port, () => {
    console.log(color.cyan(`DevServer listening at http://127.0.0.1:${port}`));
  });
});
