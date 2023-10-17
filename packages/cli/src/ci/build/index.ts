/*
 * @Author: jimmyZhao
 * @Date: 2023-09-20 10:01:25
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 14:25:10
 * @FilePath: /vg-cli/packages/cli/src/ci/build/index.ts
 * @Description:
 */
import { Env, VGConfig } from '@/config';
import { CMDObj } from '@/config/types';
import { logger, spawnSync } from '@vg-code/utils';
import path from 'path';

export default async (cmd: CMDObj) => {
  logger.wait('start building ...');
  VGConfig.initConfig(cmd);
  const ciConfig = VGConfig.ciConfig;
  logger.info({ endpoints: ciConfig.endpoints, outdir: ciConfig.outdir });

  if (ciConfig.endpoints.length === 0) {
    throw new Error('Must have validate endpoints');
  }

  for (let i = 0; i < ciConfig.endpoints.length; i++) {
    const endpoint = ciConfig.endpoints[i];
    logger.info(`using build script: ${endpoint.build}`);
    process.env.OUTPUT_PATH = path.join(ciConfig.outdir, endpoint.deployDir);
    process.env.PUBLIC_PATH = `/${endpoint.deployDir}/`;
    process.env.BASENAME = `${endpoint.uriRewrite?.original}/`;

    spawnSync(endpoint.build, { cwd: Env.cwd });
  }

  logger.ready('Build Done');
};
