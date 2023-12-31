/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:29:07
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 18:14:32
 * @FilePath: /vg-cli/scripts/.internal/utils.ts
 * @Description:
 */
import { fs, logger } from '@vg-code/utils';
import { join } from 'path';
import { PATHS } from './constants';

const { existsSync, readdirSync, readFileSync, writeFileSync } = fs;

export function getPkgs(opts?: { base?: string }): string[] {
  const base = opts?.base || PATHS.PACKAGES;
  return readdirSync(base).filter((dir) => {
    return !dir.startsWith('.') && existsSync(join(base, dir, 'package.json'));
  });
}

export function eachPkg(
  pkgs: string[],
  fn: (opts: {
    name: string;
    dir: string;
    pkgPath: string;
    pkgJson: Record<string, any>;
  }) => void,
  opts?: { base?: string },
) {
  const base = opts?.base || PATHS.PACKAGES;
  pkgs.forEach((pkg) => {
    fn({
      name: pkg,
      dir: join(base, pkg),
      pkgPath: join(base, pkg, 'package.json'),
      pkgJson: require(join(base, pkg, 'package.json')),
    });
  });
}

export function assert(v: unknown, message: string) {
  if (!v) {
    logger.error(message);
    process.exit(1);
  }
}

export function setExcludeFolder(opts: {
  cwd: string;
  pkg: string;
  dirName?: string;
  folders?: string[];
}) {
  const dirName = opts.dirName || 'packages';
  const folders = opts.folders || ['dist', 'compiled', '.turbo'];
  if (!existsSync(join(opts.cwd, '.idea'))) return;
  const configPath = join(opts.cwd, '.idea', 'umi.iml');
  let content = readFileSync(configPath, 'utf-8');
  for (const folder of folders) {
    const excludeContent = `<excludeFolder url='file://$MODULE_DIR$/${dirName}/${opts.pkg}/${folder}' />`;
    const replaceMatcher = `<content url="file://$MODULE_DIR$">`;
    if (!content.includes(excludeContent)) {
      content = content.replace(
        replaceMatcher,
        `${replaceMatcher}\n      ${excludeContent}`,
      );
    }
  }
  writeFileSync(configPath, content, 'utf-8');
}

export function toArray(v: unknown) {
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
}
