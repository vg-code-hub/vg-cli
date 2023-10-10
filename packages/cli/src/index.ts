/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:08:16
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 12:07:01
 * @FilePath: /vg-cli/packages/cli/src/index.ts
 * @Description:
 */
import { logger, semver } from '@vg-code/utils';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { build, deploy, publish } from './ci';

// const inquirer: typeof import('inquirer') = importLazy(
//   require.resolve('inquirer'),
// );

const nodeMin = '16.0.0';
if (semver.gte(nodeMin, process.version)) {
  logger.error('NodeJS version must be at least 16.');
  process.exit(0);
}

const program = new Command();

program.command('help').action((...rests) => {
  console.log(rests);

  logger.info('help vg', { args: program.args.slice(1), ...program.opts() });
});

/// CI start --->
program
  .command('build')
  .option('-s, --schema <schema>', 'specify params in tree_schema')
  .option(
    '-p , --params <params>',
    'replace words in cicd.rig.json5, only words in ${} are replacable',
  )
  .action((...rests) =>
    build({
      ...Object.assign({}, rests[0], program.opts()),
      args: program.args.slice(1),
    }),
  );

program
  .command('deploy')
  .option('-s, --schema <schema>', 'specify params in tree_schema')
  .option(
    '-p , --params <params>',
    'replace words in cicd.rig.json5, only words in ${} are replacable',
  )
  .action((...rests) => {
    let options = Object.assign({}, rests[0], program.opts());
    console.log(options);
    deploy({ ...options, args: program.args.slice(1) });
  });

program
  .command('publish')
  .option('-s, --schema <schema>', 'specify params in tree_schema')
  .option(
    '-p , --params <params>',
    'replace words in cicd.rig.json5, only words in ${} are replacable',
  )
  .action((...rests) =>
    publish({
      ...Object.assign({}, rests[0], program.opts()),
      args: program.args.slice(1),
    }),
  );
/// CI end --->

program
  .command('init')
  .option('-c, --config', 'init config file')
  .option('-m, --material', 'init common materials')
  .action((...rests) => {
    const def = async () => {
      console.log(Object.assign({}, rests[0], program.opts()));

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
      const res = await inquirer.prompt([
        {
          type: 'list',
          name: 'templateRepository',
          message: '请选择模板',
          choices: downloadUrls.map(({ title }) => {
            return { name: title };
          }),
        },
      ]);
      console.log(res);
    };
    return def();
  });

program.version(require('../package.json').version, '-v,--version');

program.parse(process.argv);
