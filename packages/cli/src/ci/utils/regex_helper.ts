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
