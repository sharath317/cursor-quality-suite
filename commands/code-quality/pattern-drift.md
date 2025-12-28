---
description: Detect when new code diverges from established codebase patterns/conventions
category: Context & Analysis
aliases: [drift, inconsistency, pattern-check]
---

# Pattern Drift - Detect Architectural Drift

Detect when new code introduces patterns that don't match historical convergence.

**Very advanced, very valuable** — flags early architectural drift before it spreads.

## Usage

```
/pattern-drift
/pattern-drift {PATH}
/pattern-drift --since="3 months"
/pattern-drift --compare-to="master"
```

## Examples

```
/pattern-drift src/features/checkout
/pattern-drift src/components --since="6 months"
/pattern-drift --compare-to="origin/master"
```

## What This Detects

### 1. New Patterns Without Precedent

```
════════════════════════════════════════════════════════════════
  PATTERN DRIFT ANALYSIS: src/features/checkout
════════════════════════════════════════════════════════════════

🆕 NEW PATTERNS INTRODUCED (No Historical Precedent)

1. State Management Pattern
   File: src/components/NewFeature/useNewFeature.ts
   Pattern: Using Zustand store
   Historical: 0 uses of Zustand in codebase
   Established: React Query + Context (47 instances)

   ⚠️ DRIFT ALERT: This introduces a new state management approach
   Action: Either adopt project-wide or align with existing pattern
   Consider: /decision-record if intentional

2. Styling Approach
   File: src/components/NewFeature/NewFeature.module.css
   Pattern: CSS Modules
   Historical: 0 CSS module files
   Established: styled-components (234 instances)

   ⚠️ DRIFT ALERT: Different styling approach
   Action: Convert to styled-components or document decision

3. Data Fetching
   File: src/hooks/useNewData.ts
   Pattern: Raw fetch() with custom caching
   Historical: 2 instances (legacy code)
   Established: React Query (89 instances)

   ⚠️ DRIFT ALERT: Bypassing established data fetching pattern
   Action: Migrate to React Query
```

### 2. Inconsistent Component Styles

```
════════════════════════════════════════════════════════════════
  COMPONENT STYLE DRIFT
════════════════════════════════════════════════════════════════

📊 Component Structure Analysis

Established Pattern (87% of components):
  ComponentName/
  ├── ComponentName.tsx
  ├── ComponentName.styled.ts
  ├── ComponentName.types.ts
  └── ComponentName.test.tsx

Drift Detected (13% of components):

1. Missing styled files:
   - NewComponent.tsx (inline styles)
   - AnotherComponent.tsx (inline styles)

2. Different file organization:
   - FeatureX/index.tsx (barrel file pattern)
   - FeatureY/styles.ts (non-standard naming)

3. Hook organization:
   - useFeatureA.ts: hooks at bottom (non-standard)
   - useFeatureB.ts: missing cleanup in useEffect
```

### 3. New Abstractions Without Precedent

```
════════════════════════════════════════════════════════════════
  NEW ABSTRACTIONS DETECTED
════════════════════════════════════════════════════════════════

🆕 New Utility/Helper Patterns

1. src/utils/createStore.ts
   Purpose: Generic store factory
   Similar existing: None

   Questions:
   - Is this necessary? Could use existing patterns?
   - Will this be adopted project-wide?
   - Does this belong in a shared library?

2. src/hooks/useGenericFetch.ts
   Purpose: Generic data fetching hook
   Similar existing: React Query (established)

   ⚠️ This duplicates React Query functionality
   Recommendation: Remove and use React Query
```

### 4. Dependency Direction Violations

```
════════════════════════════════════════════════════════════════
  DEPENDENCY DIRECTION ANALYSIS
════════════════════════════════════════════════════════════════

Established Rules:
  apps → libraries → core (downward only)

Violations Found:

1. ⚠️ Upward Dependency
   src/components/src/Component.tsx
   imports from: src/features/checkout/src/utils/helper.ts

   This creates a circular dependency risk!
   Fix: Move helper to business-modules or core

2. ⚠️ Cross-App Import
   src/features/search/src/Component.tsx
   imports from: src/features/checkout/src/types.ts

   Apps should not depend on each other!
   Fix: Move shared types to libraries
```

## Drift Categories

| Category         | Severity | Action                       |
| ---------------- | -------- | ---------------------------- |
| 🔴 Architectural | Critical | Must resolve before merge    |
| 🟠 Pattern       | High     | Strongly recommend alignment |
| 🟡 Style         | Medium   | Consider aligning            |
| 🟢 Minor         | Low      | Note for future              |

## Drift Report

```
════════════════════════════════════════════════════════════════
  PATTERN DRIFT SUMMARY
════════════════════════════════════════════════════════════════

📊 Overall Drift Score: 23% (Moderate)

By Category:
  🔴 Architectural Drift: 2 issues
  🟠 Pattern Drift: 5 issues
  🟡 Style Drift: 8 issues
  🟢 Minor Drift: 12 issues

Trend (last 3 months):
  Previous: 18% drift
  Current: 23% drift
  Direction: ↑ Increasing ⚠️

════════════════════════════════════════════════════════════════
  RECOMMENDATIONS
════════════════════════════════════════════════════════════════

Immediate Actions:
  1. 🔴 Fix dependency direction violations
  2. 🔴 Decide on state management (React Query vs Zustand)

Short-term:
  3. 🟠 Align styling approach (styled-components)
  4. 🟠 Standardize component structure

Create Decision Records:
  - If Zustand is intentional: /decision-record "Adopt Zustand for X"
  - If CSS Modules intentional: /decision-record "Use CSS Modules for Y"
```

## Pattern Detection Logic

### What We Analyze

```
1. Import Patterns
   - What libraries are imported
   - Import structure (named vs default)
   - Relative vs absolute paths

2. Component Patterns
   - File structure
   - Hook usage
   - State management approach
   - Styling method

3. API Patterns
   - Data fetching approach
   - Error handling
   - Caching strategy

4. Testing Patterns
   - Test file location
   - Test structure
   - Mock patterns
```

### Convergence Detection

```
For each pattern category:
  1. Count instances of each variant
  2. Calculate dominance (% of total)
  3. Flag variants < 20% as "drift"
  4. Flag new variants (0 history) as "new pattern"

Example:
  State Management:
    - React Query + Context: 47 instances (85%) → Established
    - Redux: 5 instances (9%) → Legacy
    - Zustand: 1 instance (2%) → Drift (new)
    - MobX: 2 instances (4%) → Drift (legacy)
```

## Integration with Other Commands

| Command                     | Integration                                  |
| --------------------------- | -------------------------------------------- |
| `/pre-pr-check`             | Runs pattern-drift as part of validation     |
| `/pr-review --architecture` | References drift analysis                    |
| `/decision-record`          | Creates ADR for intentional new patterns     |
| `/learn-from-prs`           | Updates pattern baseline                     |
| `/refactor-new`             | Suggests alignment with established patterns |

## AI Execution

When user runs `/pattern-drift`:

1. **Analyze Codebase**

    - Scan all files in scope
    - Categorize patterns by type

2. **Calculate Convergence**

    - Count instances of each pattern
    - Identify dominant patterns (established)
    - Flag minority patterns (drift)

3. **Detect New Patterns**

    - Compare recent changes to historical baseline
    - Flag patterns with no precedent

4. **Check Decision Records**

    - If pattern has ADR → Intentional, don't flag
    - If no ADR → Potential drift

5. **Generate Report**
    - Categorize by severity
    - Provide actionable recommendations
    - Suggest ADRs for intentional changes

## Customization

Create `.cursor/pattern-config.json`:

```json
{
    "established_threshold": 0.7,
    "drift_threshold": 0.2,
    "ignore_patterns": ["test files", "legacy/ folder"],
    "intentional_patterns": ["CSS Modules in design-system"]
}
```
