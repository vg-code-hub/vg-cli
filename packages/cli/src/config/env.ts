/*
 * @Author: jimmyZhao
 * @Date: 2023-10-10 18:29:49
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 18:33:10
 * @FilePath: /vg-cli/packages/cli/src/config/env.ts
 * @Description:
 */
import * as os from 'os';
import path from 'path';

const globalTemp = '.vgcode';

class Env {
  static get cwd() {
    return process.cwd();
  }
  static get globalDir() {
    return path.join(os.homedir(), globalTemp);
  }
}

export default Env;
