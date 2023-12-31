import { VGConfig } from '@/config';
import { CMDObj } from '@/config/types';
import { logger } from '@vg-code/utils';
import { Options, Ora } from 'ora';
import CDN from './cdn';

// const ora = import('ora');

const delay = async (ms: number) => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const setRewriteUri = async (
  domain: string,
  original: string | string[],
  deployDir: string | string[],
  cdn: CDN,
) => {
  const rwriteResult = await cdn.setRewriteUri(
    domain,
    Array.isArray(original) ? original : [original],
    Array.isArray(deployDir) ? deployDir : [deployDir],
    ['enhance_break'],
  );
  const domainConfigModel =
    rwriteResult.body.domainConfigList?.domainConfigModel;
  if (!domainConfigModel) {
    throw new Error('setRewriteUri fail');
  }
  let configId = domainConfigModel[0].configId;
  if (!configId) {
    throw new Error('setRewriteUri fail');
  }
  for (let i = 0; i <= 100; i++) {
    const configInfo = await cdn.describeCdnDomainConfigs(
      domain,
      configId.toString(),
    );

    const domainConfigs = configInfo?.DomainConfigs?.DomainConfig ?? [];
    let successCount = 0;
    for (const domainConfig of domainConfigs) {
      if (domainConfig.Status === 'success') {
        successCount++;
      } else if (domainConfig.Status === 'failed') {
        throw new Error('cdn rewrite fail');
      }
    }
    if (successCount === domainConfigs.length) {
      break;
    }
    if (i === 100) {
      throw new Error('cdn rewrite timeout 10min');
    }
    await delay(3000);
  }
};

const refreshCache = async (
  urls: string[],
  cdn: CDN,
  ora: (options?: string | Options | undefined) => Ora,
) => {
  const spinner = ora('Wait For RefreshCache...\n').start();

  const refreshResult = await cdn.refreshCache(urls.join('\n'));
  const refreshTaskId = refreshResult.body.refreshTaskId;
  if (!refreshTaskId) {
    throw new Error('refresh cache fail');
  }

  for (let i = 0; i <= 100; i++) {
    const desResult = await cdn.describeRefreshTaskById(refreshTaskId);
    let successCount = 0;

    const tasks = desResult.body.tasks;
    if (!tasks) continue;
    for (const item of tasks) {
      if (item.Status === 'Complete') {
        successCount++;
      } else if (item.Status === 'Failed') {
        throw new Error('RefreshCache Failed');
      }
    }

    if (successCount === tasks.length) {
      break;
    }
    if (i === 100) {
      throw new Error('refresh cache timeout 10min');
    }
    await delay(3000);
  }
  spinner.succeed('RefreshCache Done');
};

async function qyapiSendMsg(key: string, data: Object) {
  logger.info('Send Msg...');

  fetch('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=' + key, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      logger.info('Send Msg success', json);
    })
    .catch((error) => {
      logger.info('Send Msg fail', error);
    });
}

export default async (cmd: CMDObj) => {
  try {
    const rewriteConfigs: {
      [domain: string]: { original: string[]; deployDir: string[] };
    } = {};
    const setRewriteConfig = (
      domain: string,
      originalItem: string,
      deployDirItem: string,
    ) => {
      if (rewriteConfigs[domain]) {
        rewriteConfigs[domain].original.push(originalItem);
        rewriteConfigs[domain].deployDir.push(deployDirItem);
      } else {
        rewriteConfigs[domain] = {
          original: [originalItem],
          deployDir: [deployDirItem],
        };
      }
    };

    VGConfig.initConfig(cmd);
    const ciConfig = VGConfig.ciConfig;

    logger.wait('Start Publish...');
    const target = ciConfig.target;

    const cdn = new CDN(target);
    const urls: string[] = [];
    if (!ciConfig.endpoints || ciConfig.endpoints.length === 0) {
      throw new Error('Endpoints.length Can Not Be 0!');
    }
    for (const endpoint of ciConfig.endpoints) {
      if (!endpoint.uriRewrite) {
        let webEntryPath = '/';
        for (const domain of endpoint.domains) {
          // mpa|spa-history|spa-hash匹配文件
          setRewriteConfig(domain, `^\\/([^?]*\\.[a-zA-Z0-9]+)($|\\?)`, `/$1`);
          if (ciConfig.webType === 'mpa') {
            //mpa匹配非首页
            setRewriteConfig(
              domain,
              '^\\/([\\w-/]*\\w+)(?![^?]*\\.\\w+)',
              `/${endpoint.deployDir.replace(/\\/g, '/')}/$1.html`,
            );
          } else if (ciConfig.webType === 'history') {
            //spa/history匹配非首页
            setRewriteConfig(
              domain,
              '^\\/([\\w-/]*\\w+)(?![^?]*\\.\\w+)',
              `/${endpoint.deployDir.replace(/\\/g, '/')}/index.html`,
            );
          }
          //首页匹配正则，hash,history,mpa三个模式通用
          setRewriteConfig(
            domain,
            `^(${webEntryPath})($|\\?|#|\\/\\?|\\/$)`,
            `/${endpoint.deployDir.replace(/\\/g, '/')}/index.html`,
          );
          urls.push(`https://${domain}${webEntryPath}`);
        }
      } else {
        const uriRewrite = endpoint.uriRewrite;
        if (!uriRewrite) {
          continue;
        }

        for (const domain of endpoint.domains) {
          // mpa|spa-history|spa-hash匹配文件
          setRewriteConfig(domain, '^\\/([^?]*\\.[a-zA-Z0-9]+)($|\\?)', `/$1`);
          if (ciConfig.webType === 'history') {
            setRewriteConfig(
              domain,
              `${
                uriRewrite.original_regexp
                  ? uriRewrite.original_regexp
                  : uriRewrite.original
              }`,
              `/${endpoint.deployDir.replace(/\\/g, '/')}/index.html`,
            );
          } else {
            setRewriteConfig(
              domain,
              `${
                uriRewrite.original_regexp
                  ? uriRewrite.original_regexp
                  : uriRewrite.original
              }`,
              `/${endpoint.deployDir.replace(/\\/g, '/')}/index.html`,
            );
          }

          urls.push(`https://${domain}${uriRewrite.original}`);
        }
      }
    }
    const { default: ora } = await import('ora');

    // 回源URI改写
    const spinner = ora('Set RWrite URI...\n').start();

    const setRewriteUriPromises: Promise<any>[] = [];
    logger.info('rewriteConfigs: ', rewriteConfigs);
    Object.keys(rewriteConfigs).forEach((domain) => {
      const rewriteConfig = rewriteConfigs[domain];
      setRewriteUriPromises.push(
        setRewriteUri(
          domain,
          rewriteConfig.original,
          rewriteConfig.deployDir,
          cdn,
        ),
      );
    });
    if (setRewriteUriPromises.length > 0) {
      await Promise.all(setRewriteUriPromises);
    } else {
      spinner.warn('Not Have To Set RWrite URI');
    }
    spinner.succeed('Set RWrite URI Done');

    //刷新cdn
    if (urls.length > 0) {
      await refreshCache(urls, cdn, ora);
    } else {
      logger.info('Not Have To RefreshCache');
    }

    if (target.qyapi_key) {
      var content = '';

      ciConfig.endpoints.map((p) => {
        var projectName = p.dirArr[0].name;
        if (!content)
          content = `项目\`${projectName}\`部署成功${
            ciConfig.endpoints.length > 1
              ? `, 共<font color=\"warning\">${ciConfig.endpoints.length}</font>个 endpoint`
              : ''
          }\n\n`;
        var original = p.uriRewrite?.original;
        if (p.domains) {
          p.domains.forEach((domain) => {
            content += `[${domain}${original}](http://${domain}${original})\n\n`;
          });
        }
      });
      // console.log(ciConfig.endpoints, content);

      qyapiSendMsg(target.qyapi_key, {
        msgtype: 'markdown',
        markdown: {
          content,
        },
      });
    }
    logger.ready('Publish Done-----');
  } catch (e: any) {
    logger.error(e.message);
    process.exit(1);
  }
};
