/*
 * @Author: jimmyZhao
 * @Date: 2023-10-10 18:29:42
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 15:27:19
 * @FilePath: /vg-cli/packages/cli/src/config/index.ts
 * @Description:
 */
import { fs, logger } from '@vg-code/utils';
import path from 'path';
import { parse } from 'yaml';
import CIConfig from './ci_config';
import Endpoint from './ci_config/endpoint';
import DirLevel from './ci_config/level';
import Env from './env';
import { CMDObj, Config } from './types';
import { getRegExp } from './utils/regex_helper';

const { existsSync, writeFileSync } = fs;

const defaultConfig = `type: dart
# type: dart | typescript
mock:
  exclude: []
  include: []
swagger:
  # projectMap:
  #   3214855: domains/business
  #   3237635: domains/assets
  #   3214862: domains/org
  jsonUrl: http://127.0.0.1:4523/export/openapi?projectId=3237635&version=3.0
  outputDir: domains/assets/api
  urlPrefix: assets
  overwrite: true
  pathHidden:
    - /schedule/ws
  # folderFilter:
  #   - app接口
  # customPathFolder:
  #   # string startsWith
  #   /v1/common/upload: test/upload
  #   # reg match
  #   /v1/driver.*/: test/driver
  # customModelFolder:
  #   DeviceListResp: test
  #   DeviceHistoryNewResp: test/history
  # folderMap:
  #   app接口: app
  #   app接口模型: app
cicd:
  path_schema: example/{env}/{oem}
  outdir: dist
  target:
    type: alicloud
    bucket: your_bucket
    region: oss-cn-hangzhou
    access_key: \${ak}
    access_secret: \${as}
    qyapi_key: \${qyapi_key}
  endpoints:
    example/qa/main:
      build: pnpm build
      domains: [fe.baidu.com]
      uri_rewrite:
        original: /admin-main/qa
        original_regexp: ^/admin-main/qa
    example/prod/main:
      build: pnpm build
      domains: [fe.baidu.com]
      uri_rewrite:
        original: /admin-main
        original_regexp: ^/admin-main
  groups: []
`;

export function saveConfig() {
  const filePath = path.join(Env.cwd, 'vgcode.yaml');

  if (existsSync(filePath)) {
    writeFileSync(
      path.join(Env.cwd, 'vgcode.bak.yaml'),
      defaultConfig,
      'utf-8',
    );
  } else {
    writeFileSync(filePath, defaultConfig, 'utf-8');
  }
  logger.ready('config success');
}

export const getConfig: () => Config = () => {
  const filePath = path.join(Env.cwd, 'vgcode.yaml');
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf8');
    if (parse(file).yapi) {
      fs.copySync(filePath, Env.cwd.concat(`/vgcode.old.yaml`));
      fs.rmSync(filePath);
      saveConfig();
    }
    file = fs.readFileSync(filePath, 'utf8');
    return parse(file);
  }
  if (!existsSync(filePath)) saveConfig();
  return defaultConfig;
};

export class VGConfig {
  private static _instance: VGConfig;
  private _swaggerConfig?: Config['swagger'];
  private _ciConfig?: CIConfig;
  private _type: Config['type'] = 'dart';
  private _mock: Config['mock'];
  /* 单例模式 */
  private constructor() {}

  static get instance() {
    if (!VGConfig._instance) VGConfig._instance = new VGConfig();
    return VGConfig._instance;
  }

  static get type() {
    return VGConfig.instance._type;
  }

  static get mock() {
    return VGConfig.instance._mock;
  }

  static get swaggerConfig() {
    if (!VGConfig.instance._swaggerConfig) throw Error('config not init');
    return VGConfig.instance._swaggerConfig;
  }

  static get ciConfig() {
    if (!VGConfig.instance._ciConfig) throw Error('config not init');
    return VGConfig.instance._ciConfig;
  }

  static initConfig(cmdObj?: CMDObj) {
    const filePath = path.join(Env.cwd, 'vgcode.yaml');
    if (!existsSync(filePath))
      throw Error('config your vgcode.yaml then  try again');

    const config = getConfig();
    if (cmdObj)
      this.instance._ciConfig = CIConfig.createByDefault(cmdObj, config.cicd);

    this.instance._type = config.type;
    this.instance._mock = config.mock;
    this.instance._swaggerConfig = this.configSwagger(config.swagger);
  }

  private static configSwagger(swagger: Config['swagger']) {
    let folderFilter: (string | RegExp)[] = [];
    if (swagger.folderFilter) {
      if (!Array.isArray(swagger.folderFilter))
        throw Error('folderFilter must be array');
      folderFilter = (swagger.folderFilter as string[]).map(getRegExp);
    }
    let pathHidden: string[] = [];
    if (swagger.pathHidden) {
      if (!Array.isArray(swagger.pathHidden))
        throw Error('pathHidden must be array');
      pathHidden = swagger.pathHidden ?? [];
    }
    let customPathFolder = new Map();
    if (swagger.customPathFolder)
      for (const key in swagger.customPathFolder) {
        const element = (
          swagger.customPathFolder as unknown as Record<string, string>
        )[key];
        let _key = getRegExp(key);
        customPathFolder.set(_key, element);
      }
    if (swagger.urlPrefix && !swagger.urlPrefix.startsWith('/'))
      swagger.urlPrefix = '/' + swagger.urlPrefix;

    const ignoreResponse = (swagger.ignoreResponse ?? '$1.data').trim();
    const props = (
      (swagger.pageResponse?.props as unknown as string) ??
      'page,size,total,items'
    )
      .split(',')
      .map((e) => e.trim());
    swagger.pageResponse = {
      name: swagger.pageResponse?.name ?? 'PageResp.data',
      props: props,
    };
    return {
      ...swagger,
      outputDir: swagger.outputDir ?? 'api',
      folderFilter,
      pathHidden,
      customPathFolder,
      ignoreResponse,
    };
  }
}

export { Env, CIConfig, Endpoint, DirLevel };
