---
description: Generate integration/contract tests for high-risk code paths
category: Testing
aliases: [gen-tests, risk-tests, test-risky]
---

# Risk Test Gen - Generate Tests for High-Risk Paths

Analyze code risk and generate deep integration/contract tests for critical paths.

## Usage

```
/risk-test-gen {FILE_PATH}
/risk-test-gen {PR_NUMBER}
/risk-test-gen --domain payments     # Focus on domain
/risk-test-gen --coverage-gap        # Find untested high-risk paths
```

## What This Does

1. **Identifies high-risk paths** - Payments, auth, data mutations
2. **Analyzes existing coverage** - Finds gaps in critical areas
3. **Generates deep tests** - Integration, contract, edge cases
4. **Prioritizes by impact** - Business-critical first

## Risk Classification

| Risk Level  | Domains                      | Test Depth             |
| ----------- | ---------------------------- | ---------------------- |
| 🔴 Critical | Payments, Auth, PII          | Integration + Contract |
| 🟠 High     | Booking mutations, API calls | Integration            |
| 🟡 Medium   | State management, Forms      | Unit + Edge cases      |
| 🟢 Low      | UI rendering, Styling        | Snapshot only          |

## Risk Detection Patterns

```typescript
// 🔴 CRITICAL - Payment processing
const processPayment = async (paymentData: IPaymentData) => { ... }

// 🔴 CRITICAL - Authentication
const validateToken = (token: string) => { ... }

// 🔴 CRITICAL - PII handling
const updateUserProfile = (userData: IUserData) => { ... }

// 🟠 HIGH - Booking mutations
const createBooking = async (bookingData: IBooking) => { ... }

// 🟠 HIGH - External API calls
const fetchFromBackend = async (endpoint: string) => { ... }
```

## Output Format

````
📋 Analyzing risk and generating tests for PackagesV2.tsx...

════════════════════════════════════════════════════════════════
  RISK ANALYSIS
════════════════════════════════════════════════════════════════

## File: src/features/checkout/src/components/CoverageAndAddOns/PackagesV2.tsx

### Detected Risk Areas

| Line | Risk | Type | Coverage |
|------|------|------|----------|
| 45 | 🟠 HIGH | API call (useBookingWithFlow) | ❌ Untested |
| 78 | 🟠 HIGH | State mutation (onPackageSelect) | ✅ Partial |
| 112 | 🟡 MEDIUM | Price calculation | ❌ Untested |
| 156 | 🔴 CRITICAL | Booking modification | ❌ Untested |

### Current Coverage
- Lines: 45%
- Branches: 32%
- High-risk paths: 20% ⚠️

════════════════════════════════════════════════════════════════
  GENERATED TESTS
════════════════════════════════════════════════════════════════

## 1. Integration Test: Booking Modification (CRITICAL)

```typescript
describe('PackagesV2 - Booking Modification', () => {
    const mockBooking = createMockBooking({
        packages: [{ id: 'pkg-1', name: 'Basic' }]
    });

    it('should update booking when package is selected', async () => {
        const onPackageSelect = jest.fn();

        render(
            <BookingProvider booking={mockBooking}>
                <PackagesV2 onPackageSelect={onPackageSelect} />
            </BookingProvider>
        );

        await userEvent.click(screen.getByTestId('package-premium'));

        expect(onPackageSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'pkg-premium',
                price: expect.any(Number)
            })
        );
    });

    it('should handle API failure gracefully', async () => {
        server.use(
            rest.post('/api/booking/update', (req, res, ctx) =>
                res(ctx.status(500))
            )
        );

        render(<PackagesV2 booking={mockBooking} />);
        await userEvent.click(screen.getByTestId('package-premium'));

        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(mockBooking.packages).toEqual([{ id: 'pkg-1' }]); // Unchanged
    });

    it('should prevent double-submission', async () => {
        const onPackageSelect = jest.fn();

        render(<PackagesV2 onPackageSelect={onPackageSelect} />);

        // Rapid clicks
        await userEvent.click(screen.getByTestId('package-premium'));
        await userEvent.click(screen.getByTestId('package-premium'));

        expect(onPackageSelect).toHaveBeenCalledTimes(1);
    });
});
````

## 2. Contract Test: API Response Shape

```typescript
describe('PackagesV2 - API Contract', () => {
    it('should handle expected API response shape', async () => {
        const response = await api.getPackages(bookingId);

        expect(response).toMatchObject({
            packages: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(String),
                    name: expect.any(String),
                    price: expect.any(Number),
                    display_name: expect.any(String).optional(),
                    line_items: expect.arrayContaining([
                        expect.objectContaining({
                            ref_id: expect.any(String),
                            name: expect.any(String),
                            display_category: expect.stringMatching(/included|excluded/)
                        })
                    ])
                })
            ])
        });
    });

    it('should handle missing optional fields', async () => {
        server.use(
            rest.get('/api/packages', (req, res, ctx) =>
                res(ctx.json({
                    packages: [{ id: 'pkg-1', name: 'Basic', price: 0 }]
                    // display_name intentionally missing
                }))
            )
        );

        render(<PackagesV2 />);

        // Should not crash, should use fallback
        expect(screen.getByText('Basic')).toBeInTheDocument();
    });
});
```

## 3. Edge Case Tests: Price Calculation

```typescript
describe('PackagesV2 - Price Calculations', () => {
    it.each([
        [0, '€0.00'],
        [9.99, '€9.99'],
        [100.5, '€100.50'],
        [-10, '€0.00'],        // Negative should show 0
        [undefined, '€0.00'], // Missing should show 0
    ])('should format price %s as %s', (input, expected) => {
        render(<PackagesV2 packages={[{ price: input }]} />);
        expect(screen.getByTestId('package-price')).toHaveTextContent(expected);
    });

    it('should handle currency conversion', async () => {
        const booking = createMockBooking({ currency: 'USD' });
        render(<PackagesV2 booking={booking} />);

        expect(screen.getByTestId('package-price')).toHaveTextContent('$');
    });
});
```

════════════════════════════════════════════════════════════════
SUMMARY
════════════════════════════════════════════════════════════════

Generated: 3 test suites, 8 test cases
Coverage improvement: +35% on high-risk paths
Priority: 🔴 Critical paths now covered

Files created:

-   PackagesV2.integration.test.tsx
-   PackagesV2.contract.test.tsx
-   PackagesV2.edge.test.tsx

```

## AI Execution

When user runs `/risk-test-gen {PATH}`:

1. **Analyze file/PR** - Parse code for risk patterns
2. **Classify risk levels** - Map to business domains
3. **Check existing coverage** - Find gaps
4. **Generate tests** - Deep integration for critical paths
5. **Create test files** - Follow project conventions
```
