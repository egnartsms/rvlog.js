import standard from './eslint.standard.config.js'

export default [
  standard,
  {
    rules: {
      'no-use-before-define': ['error', {
        functions: false,
        classes: false,
        variables: true,
        allowNamedExports: true
      }],
      'no-labels': 'off'
    }
  }
]
