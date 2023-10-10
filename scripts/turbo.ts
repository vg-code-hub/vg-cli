/*
 * @Author: jimmyZhao
 * @Date: 2023-10-10 12:56:48
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 12:58:02
 * @FilePath: /vg-cli/scripts/turbo.ts
 * @Description: 
 */
import { PATHS } from './.internal/constants';
import { spawnSync } from '@vg-code/utils';

(async () => {
  const args = process.argv.slice(2);

  // no cache
  if (args.includes('--no-cache')) {
    args.unshift('--force');
  }

  // filter
  if (!args.includes('--filter')) {
    // Tips: should use double quotes, single quotes are not valid on windows.
    args.unshift('--filter', `"./packages/*"`);
  }

  // turbo cache
  if (!args.includes('--cache-dir')) {
    args.unshift('--cache-dir', `".turbo"`);
  }

  const command = `turbo run ${args.join(' ')}`;

  spawnSync(command, { cwd: PATHS.ROOT });
})();
