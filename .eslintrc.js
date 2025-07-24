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
    'react-hooks/rules-of-hooks': 'error',
    'react/prop-types': 'off', // Using TypeScript instead
    'react/react-in-jsx-scope': 'off', // Next.js handles this
    
    // Advanced React Hooks Rules
    'react-hooks/exhaustive-deps': [
      'error',
      {
        additionalHooks: '(useIsomorphicLayoutEffect|useUpdateEffect|useEventCallback|useQueryClient|usePrefetchQuery)',
      }
    ],
    
    // TanStack Query specific hook patterns
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="useQuery"]:not([arguments.0.type="ObjectExpression"])',
        message: 'useQuery should always use object syntax: useQuery({ queryKey, queryFn })',
      },
      {
        selector: 'CallExpression[callee.name="useMutation"]:not([arguments.0.type="ObjectExpression"])',
        message: 'useMutation should always use object syntax: useMutation({ mutationFn })',
      },
      {
        selector: 'CallExpression[callee.name="useInfiniteQuery"]:not([arguments.0.type="ObjectExpression"])',
        message: 'useInfiniteQuery should always use object syntax for consistency',
      },
    ],
    
    // Custom Hook Rules
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
      {
        enforceForRenamedProperties: false,
      }
    ],
    
    // Hook Performance & Best Practices - using no-restricted-syntax for AST-based rules
    // Note: Pattern-based rules moved to no-restricted-syntax above
    
    // Hook Naming Conventions
    'func-name-matching': 'off', // Disable to allow custom hook naming
    'consistent-return': 'off', // Allow different return patterns in hooks
    
    // Performance Rules for Hooks
    'no-array-constructor': 'error',
    'no-object-constructor': 'error',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
        'no-console': 'off', // Allow console in tests
        'react-hooks/exhaustive-deps': 'off', // Allow incomplete deps in tests
        'no-restricted-syntax': 'off', // Allow flexible syntax in tests
      },
    },
    {
      files: ['**/hooks/**/*.ts', '**/hooks/**/*.tsx', 'src/hooks/**/*.ts'],
      rules: {
        // Custom Hook Files - Extra Strict Rules
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error', // Force return types in hooks
        'prefer-const': 'error',
        'no-var': 'error',
        
        // Enforce proper hook naming
        'func-names': ['error', 'as-needed'],
        'prefer-arrow-callback': 'error',
        
        // Performance in custom hooks
        'no-array-constructor': 'error',
        'no-object-constructor': 'error',
      },
    },
    {
      files: ['**/components/**/*.tsx', 'src/app/**/*.tsx'],
      rules: {
        // Component Files - Hook Usage Rules
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',
        
        // Discourage certain patterns in components
        'no-restricted-syntax': [
          'error',
          {
            selector: 'CallExpression[callee.name="useEffect"][arguments.1.elements.length=0]',
            message: 'useEffect with empty dependency array should use useMount or similar custom hook',
          },
          {
            selector: 'CallExpression[callee.name="useEffect"]:not([arguments.1])',
            message: 'useEffect must have a dependency array. Add [] for componentDidMount behavior',
          },
        ],
      },
    },
  ],
};