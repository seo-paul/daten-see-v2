# ESLint Hook Rules - Developer Guide

## 🎯 Overview

This document describes the comprehensive ESLint configuration for React Hooks and TanStack Query implemented in our project.

## 📋 Hook-Specific Rules

### Core React Hook Rules

- **`react-hooks/rules-of-hooks`**: `error` - Enforces hooks are only called at top level
- **`react-hooks/exhaustive-deps`**: `error` - Ensures all dependencies are included in hook arrays

### Advanced Hook Rules

```javascript
'react-hooks/exhaustive-deps': [
  'error',
  {
    additionalHooks: '(useIsomorphicLayoutEffect|useUpdateEffect|useEventCallback|useQueryClient|usePrefetchQuery)',
    enableDangerousAutofixSuggestionsByDefault: false,
  }
]
```

## 🔧 TanStack Query Rules

### Enforced Object Syntax

All TanStack Query hooks must use object syntax:

```typescript
// ✅ Correct
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// ❌ Wrong - will trigger ESLint error
const { data } = useQuery(['users'], fetchUsers);
```

### Covered Hooks
- `useQuery`
- `useMutation`
- `useInfiniteQuery`

## 📁 File-Specific Rules

### Custom Hook Files (`src/hooks/**/*.ts`)

**Extra Strict Rules:**
- `@typescript-eslint/explicit-function-return-type`: `error` - All hooks must have return types
- Enhanced performance rules
- Stricter naming conventions

```typescript
// ✅ Correct custom hook
export function useUserData(userId: string): UseUserDataReturn {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}
```

### Component Files (`src/components/**/*.tsx`, `src/app/**/*.tsx`)

**Special Restrictions:**
- `useEffect` must always have dependency array
- Empty dependency arrays suggest using custom hooks

```typescript
// ❌ Will trigger ESLint error
useEffect(() => {
  // some effect
}); // Missing dependency array

// ✅ Correct
useEffect(() => {
  // some effect
}, []); // Empty array for mount-only

// 🎯 Better - use custom hook
useMount(() => {
  // some effect
});
```

## 🧪 Test Files

**Relaxed Rules:**
- `react-hooks/exhaustive-deps`: `off`
- `@typescript-eslint/no-explicit-any`: `off`
- `no-restricted-syntax`: `off`

## 🚀 Performance Rules

### Discouraged Patterns

```typescript
// ❌ Inline objects in dependencies
useEffect(() => {
  // effect
}, [{ userId: user.id }]); // ESLint error

// ✅ Extract dependencies
const userDep = useMemo(() => ({ userId: user.id }), [user.id]);
useEffect(() => {
  // effect
}, [userDep]);
```

## 🔧 Commands

### Run ESLint
```bash
# In Docker (recommended)
docker exec $(docker ps -q --filter "name=daten-see") npm run lint

# Auto-fix where possible
docker exec $(docker ps -q --filter "name=daten-see") npm run lint -- --fix
```

### ESLint Configuration Files
- Main config: `.eslintrc.js`
- This guide: `docs/development/eslint-hooks-guide.md`

## 🎯 Benefits

1. **Hook Safety**: Prevents common hook pitfalls
2. **Performance**: Catches performance anti-patterns
3. **Consistency**: Enforces modern TanStack Query patterns
4. **Type Safety**: Works with TypeScript strict mode
5. **Code Quality**: Maintains high code standards

## 🛠️ Troubleshooting

### Common Issues

1. **Import Order Errors**: Use `npm run lint -- --fix` to auto-fix
2. **Missing Return Types**: Add explicit return types to functions
3. **Hook Dependency Warnings**: Add missing dependencies or use ESLint disable comments carefully

### ESLint Disable (Use Sparingly)

```typescript
// For legitimate cases only
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  // effect with intentionally missing deps
}, []);
```

---

**Last Updated**: Task 1.7.7.2 - ESLint rules für hooks implementation