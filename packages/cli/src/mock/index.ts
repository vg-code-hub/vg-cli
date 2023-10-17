/*
 * @Author: jimmyZhao
 * @Date: 2023-10-16 14:39:01
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 14:55:43
 * @FilePath: /vg-cli/packages/cli/src/mock/index.ts
 * @Description:
 */
import { Env, VGConfig } from '@/config';
import { CMDObj } from '@/config/types';
import { compression, express } from '@/index';
import { createMockMiddleware } from '@/mock/createMockMiddleware';
import { getMockData } from '@/mock/getMockData';
import { chalk, logger, portfinder } from '@vg-code/utils';
import http from 'http';

export const mock = async (_cmd: CMDObj) => {
  await VGConfig.initConfig();
  const mock = VGConfig.mock;

  try {
    const app = express();
    // cros
    app.use((_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
      );
      res.header(
        'Access-Control-Allow-Methods',
        'GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS',
      );
      next();
    });

    // compression
    app.use(compression());

    // mock
    app.use(
      createMockMiddleware({
        context: {
          mockData: getMockData({
            cwd: Env.cwd,
            mockConfig: mock || {},
          }),
        },
      }),
    );

    const server = http.createServer(app);
    if (!server) return;

    const args = {
      port: undefined,
      host: undefined,
    };
    const port = await portfinder.getPortPromise({
      port: parseInt(String(args.port || 4172), 10),
    });

    const protocol = 'http:';

    server.listen(port, () => {
      const host =
        args.host && args.host !== '0.0.0.0' ? args.host : 'localhost';

      logger.ready(
        `App listening at ${chalk.green(`${protocol}//${host}:${port}`)}`,
      );
    });
  } catch (error) {
    logger.error(error);
  }
};
