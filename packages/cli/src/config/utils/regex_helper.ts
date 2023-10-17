/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:05:38
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 11:54:19
 * @FilePath: /vg-cli/packages/cli/src/config/utils/regex_helper.ts
 * @Description:
 */
const gitURL =
  /(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;
const matchGitName = /^(git|http).*\/(.*)(\.git)$/;
const path = /^(\/\w+){0,2}\/?$/;

/**
 * 文字下划线中划线
 * @type {RegExp}
 */
const dynamicDir = /(^\[[\w\-]+\]$)|(^\{[\w\-]+\}$)/;
export default {
  gitURL,
  path,
  dynamicDir,
  matchGitName,
};

export function getRegExp(path: string) {
  if (/^\/.*\/[g]?[ism]?$/.test(path)) {
    var parts = /^\/(.*)\/([g]?[ism]?)$/.exec(path);
    return new RegExp(parts![1], parts![2]);
  }
  return path;
}
