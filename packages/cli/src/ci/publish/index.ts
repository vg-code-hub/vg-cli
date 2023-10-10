import { CMDObj } from '@@/types';
import { axios, logger } from '@vg-code/utils';
import { Options, Ora } from 'ora';
import CIConfig from '../config';
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

  const configId = rwriteResult?.DomainConfigList.DomainConfigModel[0].ConfigId;
  for (let i = 0; i <= 100; i++) {
    const configInfo = await cdn.describeCdnDomainConfigs(domain, configId);
    console.log(configInfo);

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
  logger.info(refreshResult);

  for (let i = 0; i <= 100; i++) {
    const desResult = await cdn.describeRefreshTaskById(
      refreshResult.RefreshTaskId,
    );
    let successCount = 0;
    logger.info({ desResult });
    if (!desResult) continue;
    for (const item of desResult.Tasks) {
      if (item.Status === 'Complete') {
        successCount++;
      } else if (item.Status === 'Failed') {
        throw new Error('RefreshCache Failed');
      }
    }

    if (successCount === desResult.Tasks.length) {
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

  axios
    .post('https://qyapi.weixin.qq.com/cgi-bin/webhook/send', data, {
      params: { key },
    })
    .then(() => {
      logger.info('Send Msg success');
    })
    .catch(() => {
      logger.info('Send Msg fail');
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

    const ciConfig = CIConfig.createByDefault(cmd);

    logger.wait('Start Publish...');
    const target = Array.isArray(ciConfig.target)
      ? ciConfig.target[0]
      : ciConfig.target;

    const cdn = new CDN(target);
    const urls: string[] = [];
    if (!ciConfig.endpoints || ciConfig.endpoints.length === 0) {
      throw new Error('Endpoints.length Can Not Be 0!');
    }
    for (const endpoint of ciConfig.endpoints) {
      if (
        !endpoint.uri_rewrite &&
        (!target.uri_rewrite ||
          !target.uri_rewrite.original ||
          !target.uri_rewrite.original_regexp)
      ) {
        let webEntryPath = '/';
        for (const domain of endpoint.domains) {
          // mpa|spa-history|spa-hash匹配文件
          setRewriteConfig(domain, `^\\/([^?]*\\.[a-zA-Z0-9]+)($|\\?)`, `/$1`);
          if (ciConfig.web_type === 'mpa') {
            //mpa匹配非首页
            setRewriteConfig(
              domain,
              '^\\/([\\w-/]*\\w+)(?![^?]*\\.\\w+)',
              `/${endpoint.deployDir.replace(/\\/g, '/')}/$1.html`,
            );
          } else if (ciConfig.web_type === 'history') {
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
        const uriRewrite = endpoint.uri_rewrite
          ? endpoint.uri_rewrite
          : target.uri_rewrite;

        if (!uriRewrite) {
          continue;
        }

        for (const domain of endpoint.domains) {
          // mpa|spa-history|spa-hash匹配文件
          if (ciConfig.web_type !== 'hash') {
            setRewriteConfig(
              domain,
              '^\\/([^?]*\\.[a-zA-Z0-9]+)($|\\?)',
              `/${endpoint.deployDir.replace(/\\/g, '/')}/$1`,
            );
          } else {
            setRewriteConfig(
              domain,
              '^\\/([^?]*\\.[a-zA-Z0-9]+)($|\\?)',
              `/$1`,
            );
          }
          setRewriteConfig(
            domain,
            `${
              uriRewrite.original_regexp
                ? uriRewrite.original_regexp
                : uriRewrite.original
            }`,
            `/${endpoint.deployDir.replace(/\\/g, '/')}/index.html`,
          );
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
        var projectName = p.dirStrArr[0];
        if (!content)
          content = `项目${projectName}部署成功${
            ciConfig.endpoints.length > 1
              ? `, 共<font color=\"warning\">${ciConfig.endpoints.length}</font>个 endpoint`
              : ''
          }\n\n`;
        var original = p.uri_rewrite?.original;
        if (p.domain) {
          content += `[${p.domain}](http://${p.domain}${original})\n\n`;
        } else if (p.domains) {
          p.domains.forEach((domain) => {
            content += `[${domain}](http://${domain}${original})\n\n`;
          });
        }
      });

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
