/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:00:23
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-22 10:37:00
 * @FilePath: /vg-cli/packages/cli/src/ci/deploy/index.ts
 * @Description:
 */
import { CIConfig } from '@/config';
import { CMDObj } from '@@/types';
import { logger } from '@vg-code/utils';
import fs from 'fs';
import path from 'path';
import AliOSS from './ali_oss';

let filesList: string[] = [];
const traverseFolder = (url: string) => {
  if (fs.existsSync(url)) {
    const files = fs.readdirSync(url);
    files.forEach((file) => {
      const curPath = path.join(url, file);
      if (fs.statSync(curPath).isDirectory()) {
        traverseFolder(curPath);
      } else {
        filesList.push(curPath);
      }
    });
  } else {
    throw new Error(`Not Found FilePath: ${url}`);
  }
};

export default async (cmd: CMDObj) => {
  try {
    logger.wait('Start Deploy...');
    const ciConfig = CIConfig.createByDefault(cmd);
    logger.info({ endpoints: ciConfig.endpoints, outdir: ciConfig.outdir });
    const target = Array.isArray(ciConfig.target)
      ? ciConfig.target[0]
      : ciConfig.target;
    logger.info('oss tagert', target);
    const aliOss = new AliOSS(target);
    logger.info('Please Wait for Upload OSS...');
    if (!ciConfig.endpoints || ciConfig.endpoints.length === 0) {
      throw new Error('Endpoints.length Can Not Be 0!');
    }
    for (let i = 0; i < ciConfig.endpoints.length; i++) {
      const distPath = path.join(
        process.cwd(),
        ciConfig.outdir,
        ciConfig.endpoints[i].deployDir,
      );
      // upload filesList
      traverseFolder(distPath);
      await aliOss.putStreamFiles(filesList, ciConfig.outdir);
      filesList = [];
    }
    logger.ready('Upload OSS Done');
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};
