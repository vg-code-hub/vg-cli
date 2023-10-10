/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 10:33:57
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 18:09:36
 * @FilePath: /vg-cli/packages/utils/src/index.ts
 * @Description:
 */
import type { SpawnSyncOptions } from 'child_process';
import * as chokidar from 'chokidar';
import axios from '../compiled/axios';
import chalk from '../compiled/chalk';
import spawn from '../compiled/cross-spawn';
import * as execa from '../compiled/execa';
import * as fs from '../compiled/fs-extra';
import glob from '../compiled/glob';
import lodash from '../compiled/lodash';
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

export {
  axios,
  chalk,
  chokidar,
  execa,
  fs,
  glob,
  importLazy,
  lodash,
  logger,
  rimraf,
  semver,
  spawnSync,
  getGitInfo,
  uuid,
};
