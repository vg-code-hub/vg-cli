/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:04:41
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-16 16:46:36
 * @FilePath: /vg-cli/packages/cli/src/config/ci_config/endpoint.ts
 * @Description:
 */
import { CIConfigType, EndpointInfo } from '@/config/types';
import DirLevel from './level';

class Endpoint {
  dirArr: DirLevel[];
  build: string;
  domains: string[];
  deployDir: string = '';
  uriRewrite: EndpointInfo['uri_rewrite'] | undefined;

  static createEndpointArr(cicdConfig: CIConfigType, schema: DirLevel[]) {
    const endpointDict = cicdConfig.endpoints;
    if (!endpointDict) throw new Error('No endpoints found');
    return Object.keys(endpointDict).map((dir) => {
      const info = endpointDict[dir];
      return new Endpoint(dir, info, schema);
    });
  }

  constructor(dir: string, info: EndpointInfo, schema: DirLevel[]) {
    this.deployDir = dir;
    this.dirArr = DirLevel.createDirArr(dir, schema);
    this.build = info.build;
    this.domains = info.domains;
    this.uriRewrite = info.uri_rewrite;
  }

  /**
   *
   * @param {string[]} dirSchemaStrArr split tree_schema string into array
   * @returns {boolean}
   */
  matchCmd(dirSchemaStrArr: string[]) {
    if (this.dirArr.length < dirSchemaStrArr.length) {
      return false;
    }
    for (let i = 0; i < dirSchemaStrArr.length; i++) {
      const cmdDir = dirSchemaStrArr[i];
      const dir = this.dirArr[i];
      const dirLevel = this.dirArr[i];
      // check if dir is wildcard
      if (cmdDir !== '%') {
        if (cmdDir.indexOf('%') === 0) return false;
        // cmdDir is not group
        if (cmdDir !== dir.name) return false;
      } else {
        if (!dirLevel.dynamic) return false;
      }
    }
    return true;
  }
}

export default Endpoint;
