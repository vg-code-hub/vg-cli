/*
 * @Author: jimmyZhao
 * @Date: 2023-10-10 18:34:09
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-10 22:31:29
 * @FilePath: /vg-cli/packages/cli/src/config/config.ts
 * @Description:
 */
import { fs, logger } from '@vg-code/utils';
import path from 'path';
import Env from './env';

const { existsSync, writeFileSync } = fs;

const defaultConfig = `type: dart
# type: dart | typescript
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
