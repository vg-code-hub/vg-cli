/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:05:13
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-16 16:13:08
 * @FilePath: /vg-cli/packages/cli/src/config/ci_config/level.ts
 * @Description:
 */
import regex from '../utils/regex_helper';

class DirLevel {
  /**
   * Means that is this level's name can be set dynamically.
   * @type {boolean}
   */
  dynamic: boolean;
  /**
   * The meaning of this level.Can be changed when [this.dynamic] is true.
   * % matches all dir name.
   * @type {string}
   */
  name: string | '%';
  /**
   * The level in the directory schema
   * @type {number}
   */
  level: number;

  constructor(dirName: string, level: number) {
    this.dynamic = regex.dynamicDir.test(dirName);
    this.name = dirName;
    this.level = level;
  }

  static createSchema(treeSchema: string) {
    let dirStrArr = treeSchema.split('/');
    dirStrArr = dirStrArr.filter((dirStr) => dirStr.length > 0);
    return dirStrArr.map((dirStr, index) => {
      return new DirLevel(dirStr, index);
    });
  }

  static createDirArr(dir: string, schema: DirLevel[]) {
    let dirStrArr = dir.split('/');
    dirStrArr = dirStrArr.filter((dirStr) => dirStr.length > 0);
    return dirStrArr.map((dirStr, index) => {
      const level = new DirLevel(dirStr, index);
      level.dynamic = schema[index].dynamic;
      return level;
    });
  }
}

export default DirLevel;
