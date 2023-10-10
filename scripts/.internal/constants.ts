/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:29:07
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-19 22:24:02
 * @FilePath: /vg-cli/scripts/.internal/constants.ts
 * @Description:
 */
import { join } from 'path';

const ROOT = join(__dirname, '../../');
export const PATHS = {
  ROOT,
  PACKAGES: join(ROOT, './packages'),
  EXAMPLES: join(ROOT, './examples'),
  LERNA_CONFIG: join(ROOT, './lerna.json'),
  JEST_TURBO_CONFIG: join(ROOT, './jest.turbo.config.ts'),
} as const;

export const SCRIPTS = {
  BUNDLE_DEPS: 'vg-scripts bundleDeps',
  DEV: 'vg-scripts father dev',
  BUILD: 'vg-scripts father build',
  TEST_TURBO: 'vg-scripts jest-turbo',
} as const;
