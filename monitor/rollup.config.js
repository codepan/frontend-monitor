import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
export default {
  input: './src/index.js',
  output: {
    file: '../website/client/bundle.js',
    format: 'umd'
  },
  watch: {
    exclude: ['node_modules/**']
  },
  plugins: [
    babel({ babelrc: false, presets: ['@babel/preset-env'] }),
    resolve(),
    commonjs()
  ]
}