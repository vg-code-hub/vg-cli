/*
 * @Author: jimmyZhao
 * @Date: 2023-10-10 17:35:45
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 22:13:49
 * @FilePath: /vg-cli/packages/cli/src/swagger2restapi/init.ts
 * @Description:
 */
import { CMDObj } from '@@/types';
import { chalk, fs, logger, spawnSync } from '@vg-code/utils';
import { find } from '@vg-code/utils/compiled/lodash';
import inquirer from 'inquirer';
import path from 'path';
import { Env, saveConfig } from '../config';

const { existsSync } = fs;

async function saveMaterials() {
  const downloadUrls = [
    {
      title: '默认提供的物料',
      repository: 'https://github.com/JimmyZDD/vg-materials.git',
    },
    {
      title: '默认提供的物料(gitee)',
      repository: 'https://gitee.com/vg-code/vg-materials.git',
    },
  ];
  const { title } = await inquirer.prompt([
    {
      type: 'list',
      name: 'title',
      message: '请选择模板',
      choices: downloadUrls.map(({ title }) => {
        return { name: title };
      }),
    },
  ]);
  const { repository } = find(downloadUrls, { title })!;
  const materialDir = path.join(Env.globalDir, 'materials');

  if (existsSync(materialDir)) {
    logger.error(`exists ${materialDir}`);
    return;
  }
  spawnSync(`git clone ${repository} ${materialDir}`, { cwd: process.cwd() });
  logger.ready('init material success');
}

export default async (cmd: CMDObj) => {
  const { options } = cmd;
  console.log(cmd);

  if (!options || Object.keys(options).length === 0) {
    logger.error(
      'please config type,',
      chalk.bgGray('vg init -h'),
      ',see more info',
    );
    process.exit(1);
  }
  if (options.config) {
    saveConfig();
    process.exit(0);
  }
  saveMaterials();
};
