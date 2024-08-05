import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'


export default [
  {
    input: 'page/index.js',
    output: {
      file: 'page/dist.js',
      format: 'iife',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }
];
