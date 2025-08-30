module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'build/**/*',
    'dist/**/*',
    'node_modules/**/*',
    'scripts/**/*.js',
    'commitlint.config.js',
    '*.d.ts',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/no-require-imports': 'off',
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'no-constant-condition': ['error', { checkLoops: false }],
      },
    },
    {
      files: ['**/*.js'],
      env: {
        node: true,
      },
      extends: ['eslint:recommended'],
      rules: {
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
      },
    },
  ],
};
