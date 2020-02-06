module.exports = {
  extends: 'stylelint-config-recommended',
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['include', 'each', 'for', 'extend', 'mixin', 'warn', 'function', 'return', 'if', 'else'],
      },
    ]
  },
};