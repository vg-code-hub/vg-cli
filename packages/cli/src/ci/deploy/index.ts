/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:00:23
 * @LastEditors: zdd dongdong@grizzlychina.com
 * @LastEditTime: 2023-12-15 17:39:36
 * @FilePath: index.ts
 * @Description:
 */
import { Env, VGConfig } from '@/config';
import { CMDObj } from '@/config/types';
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
    VGConfig.initConfig(cmd);
    const ciConfig = VGConfig.ciConfig;
    logger.info({ endpoints: ciConfig.endpoints, outdir: ciConfig.outdir });
    const target = ciConfig.target;
    logger.info('oss tagert', target);
    const aliOss = new AliOSS(target);
    logger.info('Please Wait for Upload OSS...');
    if (!ciConfig.endpoints || ciConfig.endpoints.length === 0) {
      throw new Error('Endpoints.length Can Not Be 0!');
    }
    const { vg_monitor_url, vg_monitor_key } = target;
    for (let i = 0; i < ciConfig.endpoints.length; i++) {
      const distPath = path.join(
        Env.cwd,
        ciConfig.outdir,
        ciConfig.endpoints[i].deployDir,
      );
      // upload filesList
      traverseFolder(distPath);
      await aliOss.putStreamFiles(filesList, ciConfig.outdir);
      filesList = [];

      const sourcemapDir = ciConfig.endpoints[i].deployDir;
      if (vg_monitor_url && vg_monitor_key) {
        fetch(vg_monitor_url + '/updateSourcemapDir', {
          method: 'PUT',
          body: JSON.stringify({
            sourcemapDir: sourcemapDir.startsWith('/')
              ? sourcemapDir
              : `/${sourcemapDir}`,
            apikey: vg_monitor_key,
          }),
        });
      }
    }
    logger.ready('Upload OSS Done');
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }
};
