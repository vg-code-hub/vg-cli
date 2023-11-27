/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 10:33:57
 * @LastEditors: zdd dongdong@grizzlychina.com
 * @LastEditTime: 2023-11-27 20:20:49
 * @FilePath: index.ts
 * @Description:
 */
import type { SpawnSyncOptions } from 'child_process';
import * as chokidar from 'chokidar';
import esbuild from 'esbuild';
import chalk from '../compiled/chalk';
import spawn from '../compiled/cross-spawn';
import * as execa from '../compiled/execa';
import * as fs from '../compiled/fs-extra';
import glob from '../compiled/glob';
import lodash from '../compiled/lodash';
import portfinder from '../compiled/portfinder';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import * as uuid from '../compiled/uuid';
import getGitInfo from './getGitInfo';
import { importLazy } from './importLazy';
import * as logger from './logger';

function spawnSync(cmd: string, opts: SpawnSyncOptions) {
  const result = spawn.sync(cmd, {
    shell: true,
    stdio: 'inherit',
    ...opts,
  });
  if (result.status !== 0) {
    logger.error(`Execute command error (${cmd})`);
    process.exit(1);
  }
  return result;
}

export * as register from './register';
export * from './winPath';
export {
  chalk,
  chokidar,
  esbuild,
  execa,
  fs,
  getGitInfo,
  glob,
  importLazy,
  lodash,
  logger,
  portfinder,
  rimraf,
  semver,
  spawnSync,
  uuid,
};
