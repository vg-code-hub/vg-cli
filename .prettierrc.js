/*
 * @Author: jimmyZhao
 * @Date: 2023-09-14 11:12:04
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-14 11:12:12
 * @FilePath: /vg-cli/.prettierrc.js
 * @Description: 
 */
module.exports = {
  printWidth: 80,
  singleQuote: true,
  trailingComma: "all",
  proseWrap: "never",
  overrides: [{ files: ".prettierrc", options: { parser: "json" } }],
  plugins: [
    require.resolve("prettier-plugin-packagejson"),
    require.resolve("./scripts/prettier-plugin"),
  ],
};