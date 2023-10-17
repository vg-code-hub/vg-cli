/*
 * @Author: jimmyZhao
 * @Date: 2023-09-18 12:46:52
 * @LastEditors: jimmyZhao
 * @LastEditTime: 2023-10-11 15:40:35
 * @FilePath: /vg-cli/jest.config.ts
 * @Description:
 */

import { join } from 'path';

export type JSTransformer = 'esbuild' | 'swc' | 'ts-jest';

function getJSTransformer(jsTransformer: JSTransformer, opts?: any) {
  switch (jsTransformer) {
    case 'esbuild':
      return [
        require.resolve(join(__dirname, 'transformers/esbuild')),
        {
          // See https://github.com/umijs/umi/issues/10412
          target: 'es2020',
          ...opts,
          sourcemap: true,
        },
      ];
    case 'swc':
      return require.resolve('@swc-node/jest');
    case 'ts-jest':
      return require.resolve('ts-jest');
    default:
      throw new Error(`Unknown jsTransformer: ${jsTransformer}`);
  }
}

export default {
  ...{
    testMatch: ['**/*.test.(t|j)s(x)?'],
    testPathIgnorePatterns: [
      '/node_modules/',
      '<rootDir>/config/', // in case of config.test.ts
      '<rootDir>/mock/',
      '<rootDir>/.umirc.test.ts',
    ],
    transform: {
      '^.+\\.(t|j)sx?$': getJSTransformer('ts-jest', {}),
    },
    moduleNameMapper: {
      '^.+\\.(css|less|sass|scss|stylus)$':
        require.resolve('identity-obj-proxy'),
    },
    testTimeout: 30000,
    transformIgnorePatterns: [`/node_modules/(?!${[].join('|')})`],
    modulePathIgnorePatterns: [
      '<rootDir>/packages/.+/compiled',
      '<rootDir>/packages/.+/fixtures',
    ],
    // setupFiles: [require.resolve('../setupFiles/shim')],
    // resolver: require.resolve('./resolver.js'),
  },
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
