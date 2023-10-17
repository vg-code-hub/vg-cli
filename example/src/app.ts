/*
 * @Author: jimmyZhao
 * @Date: 2023-10-11 17:34:40
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-16 23:12:04
 * @FilePath: /vg-cli/example/src/app.ts
 * @Description:
 */

export const modifyContextOpts = () => {
  return {
    // 能 overrides 的参数，可参考 .umi/umi.ts 传参
    basename: BASENAME,
    // basename: '/example-main/qa/',
  };
};
