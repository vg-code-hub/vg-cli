/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:04:41
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-28 07:41:29
 * @FilePath: /vg-cli/packages/cli/src/ci/config/endpoint.ts
 * @Description:
 */
import { CICDConfig, EndpointInfo } from '@@/types';
import DirLevel from './level';

class Endpoint {
  dir: string;
  dirStrArr: string[];
  dirArr: DirLevel[];
  target: string;
  build: string;
  domain: string;
  domains: string[];
  deployDir: string = '';
  extra_env?: { [env: string]: String };
  publicPath: string = '';
  web_entry_path?: string; //effective when no validate uri_rewrite
  uri_rewrite:
    | {
        original: string;
        original_regexp: string;
        final?: string;
      }
    | undefined;

  static createEndpointArr(cicdConfig: CICDConfig, schema: DirLevel[]) {
    const endpointDict = cicdConfig.endpoints;
    if (!endpointDict) throw new Error('No endpoints found');
    return Object.keys(endpointDict).map((dir) => {
      const info = endpointDict[dir];
      return new Endpoint(dir, info, schema);
    });
  }
  constructor(dir: string, info: EndpointInfo, schema: DirLevel[]) {
    this.dir = dir;
    this.deployDir = dir;
    this.publicPath = dir;
    this.dirStrArr = dir.split('/').filter((d) => d.length > 0);
    this.dirArr = DirLevel.createDirArr(dir, schema);
    this.target = info.target;
    this.build = info.build;
    this.domain = info.domain;
    this.domains = info.domains;
    this.uri_rewrite = info.uri_rewrite;
    this.web_entry_path = info.web_entry_path;
    this.extra_env = info.extra_env;
  }

  /**
   *
   * @param {string[]} dirSchemaStrArr split tree_schema string into array
   * @returns {boolean}
   */
  matchCmd(dirSchemaStrArr: string[]) {
    if (this.dirStrArr.length < dirSchemaStrArr.length) {
      return false;
    }
    for (let i = 0; i < dirSchemaStrArr.length; i++) {
      const cmdDir = dirSchemaStrArr[i];
      const dir = this.dirStrArr[i];
      const dirLevel = this.dirArr[i];
      //check if dir is wildcard
      if (cmdDir !== '%') {
        //not wildcard
        if (cmdDir.indexOf('%') === 0) {
          return false;
        }

        //cmdDir is not group
        if (cmdDir !== dir) {
          return false;
        }
      } else {
        if (!dirLevel.dynamic) return false;
      }
    }
    return true;
  }
}

export default Endpoint;
