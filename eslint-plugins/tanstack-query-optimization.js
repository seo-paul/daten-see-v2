/**
 * Custom ESLint Plugin for TanStack Query Optimization
 * Enforces best practices for React Query usage and performance
 */

module.exports = {
  rules: {
    'prefer-stable-query-key': {
      type: 'problem',
      docs: {
        description: 'Enforce stable query keys to prevent unnecessary re-renders',
        category: 'Best Practices',
        recommended: true,
      },
      schema: [],
      create(context) {
        return {
          // Check for inline array literals in queryKey
          'CallExpression[callee.name="useQuery"] Property[key.name="queryKey"] ArrayExpression'(node) {
            const hasVariableElement = node.elements.some(element => 
              element && (
                element.type === 'CallExpression' ||
                element.type === 'ConditionalExpression' ||
                (element.type === 'Identifier' && !element.name.startsWith('QUERY_KEYS'))
              )
            );
            
            if (hasVariableElement) {
              context.report({
                node,
                message: 'Query keys with dynamic values should use useMemo or be defined outside component to prevent re-renders',
                suggest: [
                  {
                    desc: 'Wrap query key in useMemo',
                    fix(fixer) {
                      return fixer.replaceText(node, `useMemo(() => ${context.getSourceCode().getText(node)}, [])`);
                    },
                  },
                ],
              });
            }
          },
        };
      },
    },

    'no-inline-query-functions': {
      type: 'problem',
      docs: {
        description: 'Prevent inline query functions that cause re-renders',
        category: 'Performance',
        recommended: true,
      },
      schema: [],
      create(context) {
        return {
          'CallExpression[callee.name="useQuery"] Property[key.name="queryFn"] ArrowFunctionExpression'(node) {
            context.report({
              node,
              message: 'Inline queryFn causes re-renders. Extract to useCallback or define outside component.',
              suggest: [
                {
                  desc: 'Wrap in useCallback',
                  fix(fixer) {
                    const fnText = context.getSourceCode().getText(node);
                    return fixer.replaceText(node, `useCallback(${fnText}, [])`);
                  },
                },
              ],
            });
          },
        };
      },
    },

    'require-query-error-handling': {
      type: 'problem',
      docs: {
        description: 'Ensure queries have proper error handling',
        category: 'Best Practices',
        recommended: true,
      },
      schema: [],
      create(context) {
        return {
          'CallExpression[callee.name="useQuery"]'(node) {
            const queryOptions = node.arguments[0];
            if (queryOptions && queryOptions.type === 'ObjectExpression') {
              const hasOnError = queryOptions.properties.some(prop => 
                prop.key && prop.key.name === 'onError'
              );
              const hasErrorBoundary = queryOptions.properties.some(prop =>
                prop.key && prop.key.name === 'useErrorBoundary'
              );
              
              if (!hasOnError && !hasErrorBoundary) {
                context.report({
                  node,
                  message: 'useQuery should have error handling via onError callback or useErrorBoundary: true',
                });
              }
            }
          },
        };
      },
    },

    'no-manual-invalidation-patterns': {
      type: 'suggestion',
      docs: {
        description: 'Prevent common manual invalidation anti-patterns',
        category: 'Performance',
        recommended: true,
      },
      schema: [],
      create(context) {
        return {
          'CallExpression[callee.object.name="queryClient"][callee.property.name="invalidateQueries"]'(node) {
            // Check if this is inside a loop or called multiple times in sequence
            const parent = node.parent;
            const grandParent = parent && parent.parent;
            
            if (grandParent && grandParent.type === 'BlockStatement') {
              const statements = grandParent.body;
              const currentIndex = statements.indexOf(parent);
              
              // Check for consecutive invalidateQueries calls
              if (currentIndex > 0) {
                const prevStatement = statements[currentIndex - 1];
                if (prevStatement.type === 'ExpressionStatement' &&
                    prevStatement.expression.type === 'CallExpression' &&
                    prevStatement.expression.callee.object?.name === 'queryClient' &&
                    prevStatement.expression.callee.property?.name === 'invalidateQueries') {
                  
                  context.report({
                    node,
                    message: 'Multiple invalidateQueries calls should be batched with Promise.all() for better performance',
                    suggest: [
                      {
                        desc: 'Batch with Promise.all',
                        fix(fixer) {
                          // This would need more complex AST manipulation in a real implementation
                          return null;
                        },
                      },
                    ],
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};