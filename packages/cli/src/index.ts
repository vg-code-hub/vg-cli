/*
 * @Author: jimmyZhao
 * @Date: 2023-10-11 19:10:18
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 15:24:11
 * @FilePath: /vg-cli/packages/cli/src/index.ts
 * @Description:
 */
import { logger, semver } from '@vg-code/utils';
import { Command } from 'commander';
import bodyParser from '../compiled/body-parser';
import compression from '../compiled/compression';
import express, { RequestHandler } from '../compiled/express';
import { createProxyMiddleware } from '../compiled/http-proxy-middleware';
import multer from '../compiled/multer';
import pathToRegexp from '../compiled/path-to-regexp';
import sirv from '../compiled/sirv';
import { build, deploy, preview, publish } from './ci';
import { mock } from './mock';
import { init } from './swagger2restapi';

const nodeMin = '16.0.0';
if (semver.gte(nodeMin, process.version)) {
  logger.error('NodeJS version must be at least 16.');
  process.exit(1);
}

const program = new Command();

program.command('help').action((options) => {
  logger.info('help vg', { args: program.args.slice(1), options });
});

/// CI start --->
program
  .command('build')
  .option(
    '-p , --params <params>',
    'replace words in vgcode.yaml cicd config, only words in ${} are replacable',
  )
  .action((options) =>
    build({
      options,
      args: program.args.slice(1),
    }),
  );

program
  .command('deploy')
  .option(
    '-p , --params <params>',
    'replace words in vgcode.yaml cicd config, only words in ${} are replacable',
  )
  .action((options) => deploy({ options, args: program.args.slice(1) }));

program
  .command('publish')
  .option(
    '-p , --params <params>',
    'replace words in vgcode.yaml cicd config, only words in ${} are replacable',
  )
  .action((options) => publish({ options, args: program.args.slice(1) }));

program
  .command('preview')
  .option('-b , --basename <params>', 'history router basename')
  .option('-o , --outdir <params>', 'build output path', 'dist')
  .action((options) => {
    return preview({ options, args: program.args.slice(1) });
  });
/// CI end --->

/// DEV start --->
program
  .command('mock')
  .description('https://umijs.org/docs/guides/mock')
  .action((options) => mock({ options, args: program.args.slice(1) }));
/// DEV end --->

program
  .command('init')
  .option('-c, --config', 'init config file')
  .option('-m, --material', 'init common materials')
  .option('-e, --env <env>', 'publish env')
  .action((options) => init({ options, args: program.args.slice(1) }));

program.version(require('../package.json').version, '-v,--version');

program.parse(process.argv);

export {
  express,
  RequestHandler,
  sirv,
  bodyParser,
  compression,
  pathToRegexp,
  multer,
  createProxyMiddleware,
};
