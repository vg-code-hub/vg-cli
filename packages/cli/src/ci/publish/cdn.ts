import { DeployTarget } from '@/config/types';
import Cdn20180510, * as $Cdn20180510 from '@alicloud/cdn20180510';
import * as $OpenApi from '@alicloud/openapi-client';
import * as $Util from '@alicloud/tea-util';

type TFlag = 'break' | 'enhance_break' | null;

class CDN {
  AccessKeySecret: string;
  AccessKeyId: string;
  constructor(target: DeployTarget) {
    this.AccessKeyId = target.access_key;
    this.AccessKeySecret = target.access_secret;
  }
  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  private createClient(
    accessKeyId: string,
    accessKeySecret: string,
  ): Cdn20180510 {
    let config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId: accessKeyId,
      // 必填，您的 AccessKey Secret
      accessKeySecret: accessKeySecret,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Cdn
    config.endpoint = `cdn.aliyuncs.com`;
    return new Cdn20180510(config);
  }

  /**
   * 使用STS鉴权方式初始化账号Client，推荐此方式。
   * @param accessKeyId
   * @param accessKeySecret
   * @param securityToken
   * @return Client
   * @throws Exception
   */
  private createClientWithSTS(
    accessKeyId: string,
    accessKeySecret: string,
    securityToken: string,
  ): Cdn20180510 {
    let config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId: accessKeyId,
      // 必填，您的 AccessKey Secret
      accessKeySecret: accessKeySecret,
      // 必填，您的 Security Token
      securityToken: securityToken,
      // 必填，表明使用 STS 方式
      type: 'sts',
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Cdn
    config.endpoint = `cdn.aliyuncs.com`;
    return new Cdn20180510(config);
  }

  /**
   * 改写回源URI接口
   * @param {加速域名} domainName
   * @param {需要重写的url 数组} sourceUrls
   * @param {重写目标url 数组} targetUrls
   * @param {改写操作执行规则 数组 值为null、break或enhance_break} flags
   * @returns
   */
  public async setRewriteUri(
    domainName: string,
    sourceUrls: string[],
    targetUrls: string[],
    flags: TFlag[],
  ) {
    if (sourceUrls.length !== targetUrls.length) {
      throw new Error(`sourceUrls's length not equal targetUrls's length`);
    }
    const functions: Object[] = [];
    sourceUrls.forEach((item, index) => {
      functions.push({
        functionArgs: [
          {
            argName: 'source_url',
            argValue: item,
          },
          {
            argName: 'target_url',
            argValue: targetUrls[index],
          },
          {
            argName: 'flag',
            argValue: flags[index] || 'enhance_break',
          },
        ],
        functionName: 'back_to_origin_url_rewrite',
      });
    });

    let client = this.createClient(this.AccessKeyId, this.AccessKeySecret);
    let batchSetCdnDomainConfigRequest =
      new $Cdn20180510.BatchSetCdnDomainConfigRequest({
        domainNames: domainName,
        functions: JSON.stringify(functions),
      });
    let runtime = new $Util.RuntimeOptions({});
    try {
      return await client.batchSetCdnDomainConfigWithOptions(
        batchSetCdnDomainConfigRequest,
        runtime,
      );
    } catch (error: any) {
      // 错误 message
      console.error('batchSetCdnDomainConfig err:', error.message);
      // 诊断地址
      console.error('batchSetCdnDomainConfig err:', error.data['Recommend']);
      throw new Error(error.data['Recommend']);
    }
  }

  /**
   * 刷新节点上的文件内容
   * @param {刷新URL, 格式为加速域名或刷新的文件或目录。多个URL之间使用换行符(\n)或(\r\n)分隔} objectPath
   * @param {刷新的类型 File: 文件; Directory: 目录} objectType
   */
  public async refreshCache(objectPath: string, objectType?: string) {
    let client = this.createClient(this.AccessKeyId, this.AccessKeySecret);
    let runtime = new $Util.RuntimeOptions({});
    let refreshObjectCachesRequest =
      new $Cdn20180510.RefreshObjectCachesRequest({
        objectPath,
        objectType,
      });

    try {
      return await client.refreshObjectCachesWithOptions(
        refreshObjectCachesRequest,
        runtime,
      );
    } catch (error: any) {
      // 错误 message
      console.error('batchSetCdnDomainConfig err:', error.message);
      // 诊断地址
      console.error('batchSetCdnDomainConfig err:', error.data['Recommend']);
      throw new Error(error.data['Recommend']);
    }
  }

  /**
   * 预热源站内容到缓存节点
   * @param {预热URL,格式为加速域名或预热的文件 多个URL之间使用换行符(\n)或(\r\n)分隔 单条长度最长为1024个字符} objectPath
   * @returns
   */
  async pushCache(objectPath: string) {
    let client = this.createClient(this.AccessKeyId, this.AccessKeySecret);
    let pushObjectCacheRequest = new $Cdn20180510.PushObjectCacheRequest({
      objectPath,
    });

    try {
      return await client.pushObjectCache(pushObjectCacheRequest);
    } catch (error: any) {
      // 错误 message
      console.error('batchSetCdnDomainConfig err:', error.message);
      // 诊断地址
      console.error('batchSetCdnDomainConfig err:', error.data['Recommend']);
      throw new Error(error.data['Recommend']);
    }
  }

  /**
   * 通过任务编号查询刷新预热任务信息
   * @param {支持同时传入多个任务ID，多个任务ID之间用英文逗号（,）分隔，最多支持同时传入10个任务ID} taskIds
   * @returns
   */
  async describeRefreshTaskById(taskIds: string) {
    let client = this.createClient(this.AccessKeyId, this.AccessKeySecret);
    let describeRefreshTaskByIdRequest =
      new $Cdn20180510.DescribeRefreshTaskByIdRequest({
        taskId: taskIds,
      });

    try {
      return await client.describeRefreshTaskById(
        describeRefreshTaskByIdRequest,
      );
    } catch (error: any) {
      // 错误 message
      console.error('describeRefreshTaskById ErrorMessage:', error.message);
      // 诊断地址
      console.error(
        'describeRefreshTaskById ErrorRecommend:',
        error.data['Recommend'],
      );
      throw new Error(error.data['Recommend']);
    }
  }

  /**
   * 获取加速域名的配置信息
   * @param {加速域名} domainName
   * @param {功能配置ID} configId
   * @returns
   */
  async describeCdnDomainConfigs(domainName: string, configId?: string) {
    let client = this.createClient(this.AccessKeyId, this.AccessKeySecret);
    let describeCdnDomainConfigsRequest =
      new $Cdn20180510.DescribeCdnDomainConfigsRequest({
        domainName,
        configId,
      });

    try {
      return await client.describeCdnDomainConfigs(
        describeCdnDomainConfigsRequest,
      );
    } catch (error: any) {
      // 错误 message
      console.error('describeCdnDomainConfigs ErrorMessage:', error.message);
      // 诊断地址
      console.error(
        'describeCdnDomainConfigs ErrorRecommend:',
        error.data['Recommend'],
      );
      throw new Error(error.data['Recommend']);
    }
  }
}

export default CDN;
