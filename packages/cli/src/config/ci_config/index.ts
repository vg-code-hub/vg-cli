/*
 * @Author: jimmyZhao
 * @Date: 2023-09-21 22:11:04
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-17 11:39:31
 * @FilePath: /vg-cli/packages/cli/src/config/ci_config/index.ts
 * @Description:
 */
import path from 'path';
import qs from 'qs';
import { CIConfigType, CMDObj, DeployTarget } from '../types';
import Endpoint from './endpoint';
import DirLevel from './level';

class CIConfig {
  webType: 'hash' | 'history' | 'mpa';
  outdir: string;
  target: DeployTarget;
  endpoints: Endpoint[];

  constructor(
    config: Omit<CIConfigType, 'endpoints'> & { endpoints: Endpoint[] },
  ) {
    this.webType = config.web_type || 'hash';
    this.outdir = config.outdir;
    this.target = config.target;
    this.endpoints = config.endpoints;
  }

  static createByDefault({ args, options }: CMDObj, config: CIConfigType) {
    let configStr = JSON.stringify(config);
    const paramObj = qs.parse(options?.params ?? '');

    Object.keys(paramObj).forEach((key) => {
      const regStr = `\\$\\{${key}\\}`;
      const regex = new RegExp(regStr, 'g');
      configStr = configStr.replace(regex, paramObj[key] as string);
    });
    config = JSON.parse(configStr);

    var treeSchema = config.path_schema;
    const dirLevels = DirLevel.createSchema(treeSchema);

    let endpoints = Endpoint.createEndpointArr(config, dirLevels);
    const dirArr = this.getDirInSchemaStrArr({ args }, dirLevels);
    endpoints = this.createTargetEndpoints(endpoints, dirArr);

    return new CIConfig({ ...config, endpoints });
  }

  private static getDirInSchemaStrArr(
    { args }: Pick<CMDObj, 'args'>,
    dirLevel: DirLevel[],
  ) {
    let dir = args![0];
    const dirStrArr = dir.split('/').filter((str: string) => str.length > 0);
    const dirInSchemaStrArr = dir
      .split('/')
      .filter(
        (dirStr: string, index: number) =>
          dirStr.length > 0 && index < dirLevel.length,
      );

    return { dirStrArr, dirInSchemaStrArr };
  }

  private static createTargetEndpoints(
    allEndpints: Endpoint[],
    { dirInSchemaStrArr, dirStrArr }: any,
  ) {
    let endpoints = allEndpints.filter((endpoint) =>
      endpoint.matchCmd(dirInSchemaStrArr),
    );
    if (dirStrArr.length > dirInSchemaStrArr.length) {
      const sufDir = dirStrArr
        .slice(dirInSchemaStrArr.length, dirStrArr.length)
        .join('/');
      endpoints = endpoints.map((ep) => {
        ep.deployDir = path.join(ep.deployDir, sufDir);
        return ep;
      });
    }
    return endpoints;
  }
}

export default CIConfig;
