import { defineConfig, type Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/**/*'],
  minify: true,

  format: ['cjs', 'esm'],
  dts: false,
  clean: true,

  external: ['react', 'react-dom'],
  ...options,
}))