/*
 * @Author: jimmyZhao
 * @Date: 2023-09-20 10:01:25
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-28 10:12:09
 * @FilePath: /vg-cli/packages/cli/src/ci/build/index.ts
 * @Description:
 */
import { CIConfig } from '@/config';
import { CMDObj } from '@@/types';
import { logger, spawnSync } from '@vg-code/utils';
import path from 'path';

export default async (cmd: CMDObj) => {
  logger.wait('start building ...');
  const ciConfig = CIConfig.createByDefault(cmd);
  logger.info({ endpoints: ciConfig.endpoints, outdir: ciConfig.outdir });

  if (ciConfig.endpoints.length === 0) {
    throw new Error('Must have validate endpoints');
  }

  for (let i = 0; i < ciConfig.endpoints.length; i++) {
    const endpoint = ciConfig.endpoints[i];
    logger.info(`using build script: ${endpoint.build}`);
    process.env.OUTPUT_PATH = path.join(ciConfig.outdir, endpoint.deployDir);
    if (ciConfig.web_type === 'hash') {
      process.env.PUBLIC_PATH = `/${endpoint.publicPath}/`;
    }
    spawnSync(endpoint.build, { cwd: process.cwd() });
  }

  logger.ready('Build Done');
};
