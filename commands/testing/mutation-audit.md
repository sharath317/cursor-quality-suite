---
description: Run mutation tests to verify test quality, catch shallow coverage
category: Testing
aliases: [mutation, test-quality]
---

# Mutation Audit - Test Quality via Mutation Testing

Run mutation tests to verify test suite effectiveness and catch shallow coverage.

## Usage

```
/mutation-audit {FILE_PATH}
/mutation-audit {PR_NUMBER}
/mutation-audit --scope changed      # Only mutate changed files
/mutation-audit --threshold 80       # Fail if mutation score < 80%
```

## What This Does

1. **Introduces mutations** - Small code changes (mutants)
2. **Runs test suite** - Checks if tests catch mutations
3. **Calculates mutation score** - % of mutants killed
4. **Identifies weak tests** - Tests that don't catch logic changes
5. **Suggests improvements** - Better assertions for coverage

## Mutation Types

| Mutation        | Example                       | What It Tests        |
| --------------- | ----------------------------- | -------------------- |
| **Boundary**    | `>` → `>=`                    | Off-by-one errors    |
| **Negation**    | `true` → `false`              | Boolean logic        |
| **Arithmetic**  | `+` → `-`                     | Math operations      |
| **Return**      | `return x` → `return null`    | Return value usage   |
| **Conditional** | `if(a && b)` → `if(a \|\| b)` | Logic branches       |
| **Remove**      | `fn()` → `// fn()`            | Side effect reliance |

## Output Format

````
📋 Running mutation audit on PackagesV2.tsx...

════════════════════════════════════════════════════════════════
  MUTATION TESTING RESULTS
════════════════════════════════════════════════════════════════

File: src/features/checkout/src/components/CoverageAndAddOns/PackagesV2.tsx
Tests: PackagesV2.test.tsx (12 test cases)

## Summary

| Metric | Value |
|--------|-------|
| Total Mutants | 45 |
| Killed | 32 |
| Survived | 13 |
| **Mutation Score** | **71%** 🟠 |

## Survived Mutants (Tests Failed to Catch)

### 🔴 Critical: Logic not tested

| Line | Original | Mutation | Why It Matters |
|------|----------|----------|----------------|
| 78 | `price > 0` | `price >= 0` | Zero-price packages slip through |
| 112 | `isSelected && isAvailable` | `isSelected \|\| isAvailable` | Wrong selection state |
| 145 | `return total` | `return 0` | Total calculation not verified |

### 🟠 Medium: Weak assertions

| Line | Original | Mutation | Issue |
|------|----------|----------|-------|
| 56 | `setLoading(true)` | `// removed` | Loading state not asserted |
| 89 | `onSelect(pkg)` | `// removed` | Callback not verified |

### 🟢 Minor: Edge cases

| Line | Original | Mutation | Issue |
|------|----------|----------|-------|
| 23 | `packages.length` | `packages.length + 1` | Off-by-one not tested |

════════════════════════════════════════════════════════════════
  SURVIVING MUTANT DETAILS
════════════════════════════════════════════════════════════════

## Mutant #1: Boundary Condition (Line 78)

**Original:**
```typescript
if (price > 0) {
    showPrice = true;
}
````

**Mutation:**

```typescript
if (price >= 0) {
    // Changed > to >=
    showPrice = true;
}
```

**Why survived:** No test checks behavior when `price === 0`

**Suggested test:**

```typescript
it('should hide price when price is exactly 0', () => {
    render(<PackagesV2 packages={[{ price: 0 }]} />);
    expect(screen.queryByTestId('price-display')).not.toBeInTheDocument();
});
```

---

## Mutant #2: Callback Removal (Line 89)

**Original:**

```typescript
const handleSelect = (pkg: IPackage) => {
    onSelect(pkg);
    setSelected(pkg.id);
};
```

**Mutation:**

```typescript
const handleSelect = (pkg: IPackage) => {
    // onSelect(pkg);  // Removed
    setSelected(pkg.id);
};
```

**Why survived:** Test only checks UI state, not callback invocation

**Suggested test:**

```typescript
it('should call onSelect with package when clicked', () => {
    const onSelect = jest.fn();
    render(<PackagesV2 onSelect={onSelect} packages={mockPackages} />);

    userEvent.click(screen.getByTestId('package-premium'));

    expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'premium' })
    );
});
```

════════════════════════════════════════════════════════════════
RECOMMENDATIONS
════════════════════════════════════════════════════════════════

## Test Quality Score: 71% (🟠 Needs Improvement)

### Priority Fixes:

1. **Add boundary tests** (3 mutants)

    - Test `price === 0` case
    - Test empty `packages` array
    - Test single-item arrays

2. **Assert callbacks** (2 mutants)

    - Verify `onSelect` is called
    - Verify `onChange` is called with correct args

3. **Check return values** (1 mutant)
    - Assert calculated total
    - Don't just check "truthy"

### Good Practices Already Present:

✅ Error states tested
✅ Loading states tested
✅ Render without crash

### Target: 85% mutation score for critical paths

════════════════════════════════════════════════════════════════
MUTATION SCORE HISTORY
════════════════════════════════════════════════════════════════

| Date          | Score | Change |
| ------------- | ----- | ------ |
| 2024-12-23    | 71%   | -      |
| (After fixes) | ~85%  | +14%   |

````

## Commands Used

```bash
# Using Stryker for mutation testing
npx stryker run --mutate "src/features/checkout/src/**/*.tsx"

# Quick mutation check (fewer mutators)
npx stryker run --mutators "['BooleanLiteral', 'ConditionalExpression']"

# Generate HTML report
npx stryker run --reporters html
````

## Mutation Score Thresholds

| Score   | Rating       | Action                   |
| ------- | ------------ | ------------------------ |
| 90-100% | ✅ Excellent | Maintain                 |
| 80-89%  | ✅ Good      | Minor improvements       |
| 70-79%  | 🟠 Fair      | Add missing assertions   |
| 60-69%  | 🟠 Poor      | Significant test gaps    |
| <60%    | 🔴 Critical  | Major refactoring needed |

## AI Execution

When user runs `/mutation-audit {PATH}`:

1. **Parse code** - Identify mutable expressions
2. **Generate mutants** - Create code variations
3. **Run tests** - Execute against mutants
4. **Analyze survivors** - Why tests didn't catch them
5. **Generate suggestions** - Specific test improvements
6. **Report score** - With historical comparison
