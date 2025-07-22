module.exports = {
  extends: [
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript strict rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    
    // Import organization rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Architecture enforcement rules
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/shared/**'],
            importNames: ['*'],
            message: 'Shared modules cannot import from features. Move shared code to lib/ or shared/',
          },
          {
            group: ['@/lib/**'],
            importNames: ['*'],
            message: 'Lib modules cannot import from features or shared. Keep lib/ as pure infrastructure.',
          },
        ],
      },
    ],
    
    // Code quality rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    
    // React best practices
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Using TypeScript instead
    'react/react-in-jsx-scope': 'off', // Next.js handles this
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
};