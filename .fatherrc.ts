import { defineConfig } from 'father';

export default defineConfig({
  cjs: {
    input: 'packages',
    output: 'dist',
    ignores: ['packages/ci/*', 'packages/utils/*'],
  },
});
