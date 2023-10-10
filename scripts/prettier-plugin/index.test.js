/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:16:21
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-18 12:50:42
 * @FilePath: /vg-cli/scripts/prettier-plugin/index.test.js
 * @Description: 
 */
const prettier = require('prettier');
const code = `
import 'b';
import 'a';
// sort-object-keys
const foo = { b, a};
`;
const ret = prettier.format(code, {
  parser: 'typescript',
  plugins: [require.resolve('./')]
});
console.log(ret);
test('normal', () => { });

