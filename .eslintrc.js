module.exports = {
  extends: 'love',
  parserOptions: {
      project: './tsconfig.eslint.json'
  },
  rules: {
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': ['error', { ignoreConditionalTests: true, ignoreTernaryTests: true }],
    '@typescript-eslint/prefer-readonly': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  }
}
