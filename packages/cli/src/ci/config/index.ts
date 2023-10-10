/*
 * @Author: jimmyZhao
 * @Date: 2023-09-21 22:11:04
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-28 07:39:45
 * @FilePath: /vg-cli/packages/cli/src/ci/config/index.ts
 * @Description:
 */
import { CIConfigType, CMDObj, DeployTarget } from '@@/types';
import fs from 'fs';
import path from 'path';
import qs from 'qs';
import { parse } from 'yaml';
import Endpoint from './endpoint';
import DirLevel from './level';

class CIConfig {
  web_type: 'hash' | 'history' | 'mpa';
  outdir: string;
  target: DeployTarget | DeployTarget[];
  endpoints: Endpoint[];

  constructor(config: CIConfigType) {
    this.web_type = config.web_type || 'hash';
    this.outdir = config.outdir;
    this.target = config.target;
    this.endpoints = config.endpoints;
  }

  static createByDefault({ args, schema, params }: CMDObj) {
    let config = parse(
      fs.readFileSync(`${process.cwd()}/vgcode.yaml`, 'utf8'),
    ).cicd;
    let configStr = JSON.stringify(config);

    const paramObj = qs.parse(params);

    Object.keys(paramObj).forEach((key) => {
      const regStr = `\\$\\{${key}\\}`;
      const regex = new RegExp(regStr, 'g');
      configStr = configStr.replace(regex, paramObj[key] as string);
    });
    config = JSON.parse(configStr);

    var treeSchema = config.path_schema;

    const dirLevel = DirLevel.createSchema(treeSchema);

    let endpoints = Endpoint.createEndpointArr(config, dirLevel);
    const dirArr = this.getDirInSchemaStrArr(
      {
        args,
        schema,
      },
      dirLevel,
    );
    endpoints = this.createTargetEndpoints(endpoints, dirArr);

    return new CIConfig({ ...config, endpoints });
  }

  private static getDirInSchemaStrArr(
    { args, schema }: Omit<CMDObj, 'params'>,
    dirLevel: DirLevel[],
  ) {
    let dir = args![0];
    const schemaKeys = dir.match(/(?<=\{)[a-zA-Z]+(?=\})/g) || [];
    const schemaObj = qs.parse(schema);

    for (let key of schemaKeys) {
      const val = schemaObj[key];
      if (val) {
        dir = dir.replace(`{${key}}`, val as string);
      }
    }
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
        ep.publicPath = ep.deployDir;
        return ep;
      });
    }
    return endpoints;
  }
}

export default CIConfig;
