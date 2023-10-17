/*
 * @Author: jimmyZhao
 * @Date: 2023-10-11 11:08:57
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 15:25:11
 * @FilePath: /vg-cli/packages/cli/src/ci/preview/index.ts
 * @Description:
 */
import { Env } from '@/config';
import { CMDObj } from '@/config/types';
import { compression, createProxyMiddleware, express, sirv } from '@/index';
import { createMockMiddleware } from '@/mock/createMockMiddleware';
import { getMockData } from '@/mock/getMockData';
import { chalk, logger, portfinder } from '@vg-code/utils';
import { existsSync } from '@vg-code/utils/compiled/fs-extra';
import assert from 'assert';
import http from 'http';
import { join, resolve } from 'path';

export default async ({ args, options }: CMDObj) => {
  let deployDir = args![0];
  const basename = options?.basename ?? '/';
  const outdir = options?.outdir ?? 'dist';
  const outputPath: string = join(outdir, deployDir);
  const basePath: string = `/${deployDir}/`;
  const historyRouter = {
    type: undefined,
  };
  const mock = undefined;

  // 检查构建的静态资源是否存在
  const distDir = resolve(Env.cwd, join(Env.cwd, outputPath));

  assert(
    existsSync(distDir),
    'build output dir not found, please run umi build',
  );
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

    app.use(
      basePath,
      sirv(distDir, {
        etag: true,
        dev: true,
        single: true,
      }),
    );
    const args = {
      port: undefined,
      host: undefined,
    };

    const port = await portfinder.getPortPromise({
      port: parseInt(String(args.port || 4172), 10),
    });

    // history fallback
    // 在向服务端发起请求时，去掉标识xhr的前缀
    const pathRewrite: Record<string, string> = {};
    pathRewrite[`^${basename}`] = `${basePath}index.html`;
    app.use(
      basename,
      createProxyMiddleware({
        target: `http://localhost:${port}`, // 这一行是你的服务端地址
        changeOrigin: true,
        pathRewrite,
      }),
    );

    // 如果是 browser，并且配置了非 / base，访问 / 时 /index.html redirect 到 base 路径
    app.use((_req, res, next) => {
      const historyType = historyRouter.type || 'browser';
      const canredirect =
        historyType === 'browser' &&
        basePath !== '/' &&
        (_req.path === '/' || _req.path === '/index.html');

      if (canredirect) {
        return res.redirect(basename);
      }

      next();
    });

    const server = http.createServer(app);
    if (!server) return;

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
