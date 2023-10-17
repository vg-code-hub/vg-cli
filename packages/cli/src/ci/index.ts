/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:34:31
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-11 11:10:08
 * @FilePath: /vg-cli/packages/cli/src/ci/index.ts
 * @Description:
 */

import build from './build';
import deploy from './deploy';
import preview from './preview';
import publish from './publish';

export { publish, deploy, build, preview };
