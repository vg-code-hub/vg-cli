/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 11:11:14
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-28 10:12:48
 * @FilePath: /vg-cli/scripts/father.ts
 * @Description:
 */
import { spawnSync } from '@vg-code/utils';

(async () => {
  const args = process.argv.slice(2);

  const isBuild = args.includes('build');
  if (isBuild) {
    args.push('--quiet');
  }

  const command = `father ${args.join(' ')}`;

  spawnSync(command, { cwd: process.cwd() });
})();
