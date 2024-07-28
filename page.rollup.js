import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'


export default [
  {
    input: 'page/index-source.js',
    output: {
      file: 'page/index.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
];
