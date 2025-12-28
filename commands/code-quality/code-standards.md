---
description: Reference guide for code quality standards, component limits, hook patterns
category: Code Quality
aliases: [standards, quality, limits]
---

# Code Standards Enforcement

Guidelines based on historical codebase analysis.

**Purpose:** Reference for analytical commands (not real-time enforcement)

**Auto-enforced version:** `.cursor/rules/web-standards.mdc` (enforces while typing)

**Used by:** `/full-flow`, `/pr-review`, `/pr-fix`, `/pr-checklist`, `/migration-plan`

**Run automated check:**

```bash
.cursor/scripts/code-quality-check.sh {PATH}
```

> **Note:** Static constraints are auto-enforced by `.mdc` rules.
> This command provides the reference documentation and analytical context.

## Component Size Limits (MUST ENFORCE)

When generating or reviewing code, check these limits:

| Metric          | ✅ Target | ⚠️ Warning | 🔴 Refactor |
| --------------- | --------- | ---------- | ----------- |
| Lines of code   | < 150     | 150-300    | > 300       |
| Imports         | < 20      | 20-35      | > 35        |
| useState calls  | < 4       | 4-6        | > 6         |
| useEffect calls | < 3       | 3-5        | > 5         |
| Custom hooks    | < 8       | 8-15       | > 15        |

### Enforcement Actions

**When generating new code:**

-   NEVER create components exceeding warning limits
-   Split into sub-components proactively
-   Extract hooks for complex logic

**When reviewing existing code:**

-   Flag violations in review comments
-   Suggest decomposition strategy
-   Reference this checklist

## Feature Structure (MUST FOLLOW)

```
FeatureName/
├── FeatureName.tsx              # Orchestrator (< 100 lines)
├── FeatureName.styled.ts        # Styles only
├── FeatureName.types.ts         # Types/interfaces
├── FeatureName.test.tsx         # Tests
├── FeatureName.mock.ts          # Shared mocks
│
├── hooks/                       # Feature-specific hooks
│   ├── useFeatureState.ts
│   ├── useFeatureData.ts
│   └── useFeatureTracking.ts
│
├── components/                  # Sub-components (each < 150 lines)
│   ├── FeatureHeader/
│   ├── FeatureContent/
│   └── FeatureActions/
│
└── utils/
    └── helpers.ts
```

## Hook Design Rules

### ✅ GOOD Patterns

```typescript
// Single responsibility
export const useFeatureData = (id: string) => {
    // Only data fetching logic
};

// Composition
export const useFeature = () => {
    const data = useFeatureData();
    const state = useFeatureState();
    return { ...data, ...state };
};

// AbortController for async
useEffect(() => {
    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort();
}, [dep]);
```

### ❌ BAD Patterns (NEVER Generate)

```typescript
// God hook with 30+ returns
export const useEverything = () => {
    const [a, setA] = useState();
    const [b, setB] = useState();
    // ... 15 more states
    useEffect(() => {}, []);
    useEffect(() => {}, []);
    // ... 8 more effects
    return { a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p };
};

// Missing cleanup
useEffect(() => {
    fetchData().then(setData); // Race condition!
}, []);

// watch() instead of useWatch
const value = methods.watch(); // Causes re-renders
```

## Styling Rules

### ALWAYS Use Design Tokens

```typescript
// ✅ GOOD
import { spacing } from '@your-org/design-system/src/utils/spacing';
import { color } from '@your-org/design-system/src/utils/colors';

padding: ${spacing('xs')};
background: ${color('container1')};

// ❌ BAD - Never hardcode
padding: 16px;
background: #ffffff;
```

### Responsive Patterns

```typescript
import { OXBiggerThan } from '@your-org/design-system/src/enums/OXBiggerThan';

// ✅ GOOD
@media ${OXBiggerThan.Small} {
    padding: ${spacing('m')};
}

// ❌ BAD
@media (min-width: 768px) {
    padding: 24px;
}
```

## State Management Rules

### Colocation Principle

```typescript
// ✅ State where it's used
const FeatureSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    return <Collapsible open={isOpen} />;
};

// ✅ Context for shared state
const FeatureProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initial);
    return (
        <FeatureContext.Provider value={{ state, dispatch }}>
            {children}
        </FeatureContext.Provider>
    );
};

// ❌ Prop drilling > 3 levels
<A data={x}><B data={x}><C data={x}><D data={x} /></C></B></A>
```

## Import Organization

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';

// 2. YourCompany packages (alphabetical)
import { useOXBreakpoint } from '@your-org/design-system';
import { OXTypography } from '@your-org/design-system/src/ui/components/p100/Typography';

// 3. Relative imports
import * as S from './Component.styled';
import type { IComponent } from './Component.types';
import { useComponentData } from './hooks/useComponentData';
```

## Decomposition Triggers

When you see these patterns, IMMEDIATELY suggest decomposition:

1. **File > 300 lines** → Split by responsibility
2. **> 6 useState** → Extract to useReducer or custom hook
3. **> 5 useEffect** → Split into focused hooks
4. **> 35 imports** → Component doing too much
5. **Nested ternaries** → Extract to sub-components
6. **Repeated JSX blocks** → Extract to component

## Quick Check Before Generating

Before generating any component:

-   [ ] Will it exceed 150 lines?
-   [ ] Does it need > 4 useState?
-   [ ] Does it need > 3 useEffect?
-   [ ] Are there > 20 imports?
-   [ ] Is there a simpler decomposition?

If ANY answer is "yes", restructure BEFORE generating.
