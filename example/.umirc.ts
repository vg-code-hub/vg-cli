/*
 * @Author: jimmyZhao
 * @Date: 2023-09-19 22:38:06
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-22 11:55:40
 * @FilePath: /vg-cli/example/.umirc.ts
 * @Description:
 */
import { defineConfig } from 'umi';

console.log(process.env.PUBLIC_PATH);
console.log(process.env.OUTPUT_PATH);

export default defineConfig({
  hash: true,
  history: { type: 'hash' },
  outputPath: process.env.OUTPUT_PATH,
  publicPath: process.env.PUBLIC_PATH,
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'pnpm',
});
