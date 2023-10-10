/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:46:52
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-09-19 22:23:20
 * @FilePath: /vg-cli/jest.config.ts
 * @Description:
 */
export default {
  testMatch: ['<rootDir>/packages/*/src/**/*.test.ts'],
  modulePathIgnorePatterns: [
    '<rootDir>/packages/.+/compiled',
    '<rootDir>/packages/.+/fixtures',
  ],
  transformIgnorePatterns: ['/node_modules/', '/compiled/'],
  collectCoverageFrom: [
    '**/src/**/*.{ts,tsx}',
    '!**/examples/**/*.{js,jsx,ts,tsx}',
    '!**/compiled/**/*.{js,jsx}',
    '!**/fixtures/**/*.*',
  ],
};
