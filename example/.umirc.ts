/*
 * @Author: jimmyZhao
 * @Date: 2023-09-19 22:38:06
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-16 23:12:28
 * @FilePath: /vg-cli/example/.umirc.ts
 * @Description:
 */
import { defineConfig } from 'umi';

export default defineConfig({
  hash: true,
  // history: { type: 'hash' },
  outputPath: process.env.OUTPUT_PATH,
  publicPath: process.env.PUBLIC_PATH,
  links: [{ rel: 'icon', href: `${process.env.PUBLIC_PATH ?? ''}favicon.ico` }],
  define: {
    BASENAME: process.env.BASENAME,
  },
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  npmClient: 'pnpm',
  jsMinifier: 'none',
});
