# SeshTracker Type Definitions

This directory contains TypeScript type definitions for the SeshTracker ecosystem.

## Type Structure

- `cannabis.ts` - Primary source of cannabis-specific types
- `inventory.ts` - Legacy inventory management types
- `session.ts` - Legacy session tracking types
- `index.ts` - Consolidated re-exports from all type files

## Usage Guidelines

### Preferred Imports

Always import types from the central `index.ts` file to ensure you're using the most up-to-date types:

```typescript
import { CannabisStrain, TrackingSession, InventoryItem } from '../types';
```

### Type Naming Convention

When there are naming conflicts, we use the following convention:

- Primary types from `cannabis.ts` keep their original name
- Conflicting types from legacy files are prefixed with "Legacy" (e.g., `LegacySession`)

### Type Hierarchy

1. **Cannabis Base Types**: `StrainType`, `Dominance`, `EffectType`, etc.
2. **Entity Types**: `CannabisStrain`, `TrackingSession`, `InventoryItem` 
3. **Utility Types**: `APIResponse<T>`, `EffectRating`, etc.

### Working with Legacy Code

If you're working with older components that expect the legacy type structure, use the "Legacy" prefixed types:

```typescript
import { LegacySession, LegacyProductType } from '../types';
```

## Migration Path

We're gradually migrating all code to use the consolidated types in `cannabis.ts`. When updating components:

1. Change imports to use the central `index.ts`
2. Replace legacy types with the new consolidated types
3. Update any component props or state types to match the new type structures

## Type Structure Documentation

For detailed information about each type, see:

- `CannabisStrain` - Represents strain information including effects and chemical profiles
- `TrackingSession` - Represents a cannabis consumption session with effects and dosage
- `InventoryItem` - Represents a cannabis product in the user's inventory

Please refer to the JSDoc comments in the type definition files for detailed field documentation.
