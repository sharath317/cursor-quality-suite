---
description: Generate Mermaid diagrams for code architecture visualization (v4.1 Frontend-Enhanced)
category: Analysis & Documentation
aliases: [diagram, architecture, mermaid, sequence, class, xstate, dataflow]
---

# Visualize Architecture - Generate Diagrams (v4.1)

Create visual diagrams (Mermaid) for architecture, data flow, component relationships, and **frontend-specific patterns**.

## Usage

```
/visualize-architecture {SCOPE}
/visualize-architecture {SCOPE} --type={diagram_type}
/visualize-architecture {SCOPE} --data-flow           # Props vs Context analysis
/visualize-architecture {SCOPE} --boundaries          # Suspense/Error boundaries
/visualize-architecture {SCOPE} --xstate              # XState-compatible state chart
```

## Diagram Types

### Available Types

| Type         | Use Case                                    |
| ------------ | ------------------------------------------- |
| `component`  | Component hierarchy and relationships       |
| `sequence`   | Request/data flow through system            |
| `class`      | Class/interface relationships               |
| `state`      | State machine for complex logic             |
| `flowchart`  | Decision trees and workflows                |
| `er`         | Entity relationships (data models)          |
| `dataflow`   | **NEW:** Props vs Context data flow         |
| `boundaries` | **NEW:** Suspense/ErrorBoundary locations   |
| `xstate`     | **NEW:** XState-compatible state definition |

### Auto-Detection

If `--type` not specified, I'll auto-detect based on scope:

-   React components → `component` diagram
-   API/hooks → `sequence` diagram
-   Types/interfaces → `class` diagram
-   State machines / reducers → `state` diagram
-   Context providers → `dataflow` diagram

## Examples

### Component Hierarchy

```
/visualize-architecture src/features/checkout/src/components/Packages
```

Output:

```mermaid
graph TD
    subgraph Packages
        A[PackagesV2] --> B[ProtectionPackageCard]
        A --> C[ExtrasPackageCard]
        A --> D[PackagesSkeleton]

        B --> E[LineItems]
        B --> F[PackageHeader]
        B --> G[PackagePricing]

        E --> H[LineItem]
        E --> I[TooltipTitle]
    end

    style A fill:#ff6b35
    style B fill:#4ecdc4
    style C fill:#4ecdc4
```

### Sequence Diagram (Data Flow)

```
/visualize-architecture useBookingData --type=sequence
```

Output:

```mermaid
sequenceDiagram
    participant C as Component
    participant H as useBookingData
    participant API as BookingAPI
    participant S as Store

    C->>H: Initialize hook
    H->>API: fetchBooking(id)
    API-->>H: BookingResponse
    H->>S: updateStore(data)
    S-->>C: Re-render with data

    Note over H: AbortController cleanup on unmount
```

### State Diagram

```
/visualize-architecture BookingFlow --type=state
```

Output:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: fetchBooking
    Loading --> Success: data received
    Loading --> Error: request failed
    Success --> Updating: modifyBooking
    Updating --> Success: update complete
    Error --> Loading: retry
    Success --> [*]: complete
```

### Class Diagram (Types)

```
/visualize-architecture src/types/Booking --type=class
```

Output:

```mermaid
classDiagram
    class Booking {
        +string id
        +BookingStatus status
        +Vehicle vehicle
        +Customer customer
        +getTotal() number
    }

    class Vehicle {
        +string id
        +string name
        +VehicleCategory category
    }

    class Customer {
        +string id
        +string email
        +Address address
    }

    Booking "1" --> "1" Vehicle
    Booking "1" --> "1" Customer
```

## AI Execution

When user runs `/visualize-architecture {SCOPE}`:

### Step 1: Analyze Scope

```
1. Identify files/folders in scope
2. Detect primary pattern (components, hooks, types)
3. Select appropriate diagram type
4. Extract relationships
```

### Step 2: Generate Diagram

```
1. Parse code structure
2. Identify nodes (components, functions, types)
3. Map relationships (imports, props, calls)
4. Generate Mermaid syntax
```

### Step 3: Render

```mermaid
{generated_diagram}
```

### Step 4: Offer Variations

```
📊 Architecture Diagram Generated

Variations available:
1. Add more detail (show props/methods)
2. Simplify (high-level only)
3. Different view (sequence instead of component)
4. Focus on specific path

Which variation? (1/2/3/4/done)
```

## Integration

### With Documentation

```
/visualize-architecture {SCOPE} --output=docs/architecture/
```

Creates:

-   `{scope}-diagram.md` with Mermaid
-   Links from relevant component docs

### With PR Description

```
/visualize-architecture --pr-diff
```

Generates diagram showing:

-   Files changed
-   Relationships affected
-   New connections added

## Tips

1. **Start broad, then narrow**

    ```
    /visualize-architecture src/features/checkout  # Overview
    /visualize-architecture src/features/checkout/src/hooks  # Focus
    ```

2. **Use for onboarding**

    ```
    /visualize-architecture --key-flows
    ```

    Generates diagrams for critical paths

3. **Before refactoring**
    ```
    /visualize-architecture {target} --show-coupling
    ```
    Highlights tightly coupled components

---

## 🆕 Frontend-Specific Diagrams (v4.1)

### Data Flow Diagram (Props vs Context)

```
/visualize-architecture src/features/checkout/src/components/Checkout --data-flow
```

Output:

```mermaid
graph TD
    subgraph "Data Sources"
        API[BookingAPI]
        CTX[BookingContext]
        PROPS[Parent Props]
    end

    subgraph "Components"
        A[CheckoutPage]
        B[VehicleSection]
        C[ProtectionSection]
        D[PaymentSection]
    end

    API -->|"useBookingData()"| A
    A -->|"Context.Provider"| CTX

    CTX -.->|"useBooking()"| B
    CTX -.->|"useBooking()"| C
    CTX -.->|"useBooking()"| D

    A -->|"vehicle: Vehicle"| B
    A -->|"packages: Package[]"| C

    style CTX fill:#e1f5fe
    style PROPS fill:#fff3e0

    classDef contextData stroke:#0288d1,stroke-width:2px
    classDef propData stroke:#ff9800,stroke-width:2px
```

**Legend:**

-   Solid lines = Props drilling
-   Dashed lines = Context consumption
-   Blue = Context-based data
-   Orange = Prop-based data

### Suspense & Error Boundaries Map

```
/visualize-architecture src/features/checkout --boundaries
```

Output:

```mermaid
graph TD
    subgraph "App Root"
        ROOT[App]
        EB1[ErrorBoundary: AppError]
    end

    subgraph "Routes"
        R1[/checkout]
        R2[/checkout/payment]
    end

    subgraph "Suspense Zones"
        S1[Suspense: CheckoutSkeleton]
        S2[Suspense: PaymentSkeleton]
    end

    subgraph "Async Components"
        AC1[VehicleDetails - lazy]
        AC2[PackageList - lazy]
        AC3[PaymentForm - lazy]
    end

    ROOT --> EB1
    EB1 --> R1
    EB1 --> R2

    R1 --> S1
    S1 --> AC1
    S1 --> AC2

    R2 --> S2
    S2 --> AC3

    style EB1 fill:#ffcdd2
    style S1 fill:#c8e6c9
    style S2 fill:#c8e6c9

    classDef errorBoundary fill:#ffcdd2,stroke:#c62828
    classDef suspense fill:#c8e6c9,stroke:#2e7d32
```

**Analysis includes:**

-   ErrorBoundary coverage (red zones)
-   Suspense boundaries (green zones)
-   Lazy-loaded components
-   Missing boundaries (warnings)

### XState-Compatible State Chart

```
/visualize-architecture useCheckoutFlow --xstate
```

Output:

```mermaid
stateDiagram-v2
    [*] --> idle

    state idle {
        [*] --> ready
    }

    idle --> loading: FETCH_VEHICLE
    loading --> vehicleLoaded: VEHICLE_SUCCESS
    loading --> error: VEHICLE_ERROR

    vehicleLoaded --> selectingPackages: CONTINUE
    selectingPackages --> packageSelected: SELECT_PACKAGE
    packageSelected --> selectingPackages: CHANGE_PACKAGE
    packageSelected --> payment: CONTINUE_TO_PAYMENT

    payment --> processing: SUBMIT
    processing --> success: PAYMENT_SUCCESS
    processing --> error: PAYMENT_ERROR

    error --> idle: RETRY
    success --> [*]
```

**XState Export:**

```typescript
// Generated XState machine definition
export const checkoutMachine = createMachine({
    id: 'checkout',
    initial: 'idle',
    states: {
        idle: {
            on: { FETCH_VEHICLE: 'loading' },
        },
        loading: {
            invoke: {
                src: 'fetchVehicle',
                onDone: 'vehicleLoaded',
                onError: 'error',
            },
        },
        // ... full machine
    },
});
```

### Component Render Tree with Re-render Analysis

```
/visualize-architecture {SCOPE} --render-analysis
```

Shows:

-   Which components re-render on state changes
-   Memo boundaries
-   Context consumer impact zones

```mermaid
graph TD
    subgraph "Re-renders on booking change"
        A[CheckoutPage 🔄]
        B[VehicleSection 🔄]
        C[PriceDisplay 🔄]
    end

    subgraph "Memoized (stable)"
        D[Header ⚡]
        E[Footer ⚡]
        F[StaticContent ⚡]
    end

    A --> B
    A --> C
    A --> D
    A --> E

    style A fill:#ffecb3
    style B fill:#ffecb3
    style C fill:#ffecb3
    style D fill:#c8e6c9
    style E fill:#c8e6c9
```

**Legend:**

-   🔄 Yellow = Re-renders on state change
-   ⚡ Green = Memoized / Stable

## Integration with /plan-and-budget

When running `/plan-and-budget`, optionally generate:

```
/plan-and-budget "Add new feature" --with-diagram
```

Includes architecture diagram in the plan showing:

-   Current state
-   Proposed changes
-   Impact zones
