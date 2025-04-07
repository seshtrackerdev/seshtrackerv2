# Component Migration Workflow

This guide outlines the process of migrating existing components to the new directory structure and type system in the SeshTracker ecosystem.

## Directory Migration Steps

When migrating a component from the flat structure to the new organized structure:

1. **Identify Component Type**

First, determine which category the component belongs to:

- `dashboard` - Dashboard components, analytics, summaries
- `inventory` - Inventory management components
- `sessions` - Session tracking components
- `common` - Reusable UI components
- `layouts` - Page layouts and structural components

2. **Create New Component File**

Create the new component file in the appropriate directory:

```
src/react-app/components/[category]/ComponentName.tsx
```

3. **Update Imports**

Update all imports in the component:

```typescript
// OLD imports
import { Session } from '../types/session';
import { someUtil } from '../utils/someUtil';

// NEW imports
import { TrackingSession } from '../../../types';
import { someUtil } from '../../../utils/someUtil';
```

4. **Update Type Usage**

Replace legacy types with the new consolidated types:

```typescript
// OLD type usage
function SessionCard({ session }: { session: Session }) {
  // ...
}

// NEW type usage
function SessionCard({ session }: { session: TrackingSession }) {
  // ...
}
```

5. **Update Component Exports**

Make sure to export the component properly:

```typescript
export default SessionCard;
```

6. **Update Import References**

Find all places where the component is imported and update the paths:

```typescript
// OLD import
import SessionCard from './SessionCard';

// NEW import
import SessionCard from './components/sessions/SessionCard';
```

## CSS Migration

1. **Move CSS Files**

If the component has a CSS file, move it to the same directory:

```
src/react-app/components/[category]/ComponentName.css
```

2. **Update CSS Imports**

Update the CSS import in the component:

```typescript
// OLD import
import './ComponentName.css';

// NEW import
import './ComponentName.css';
```

## Testing Migration

1. **Move Test Files**

Move test files to the appropriate test directory:

```
tests/unit/components/[category]/ComponentName.test.tsx
```

2. **Update Test Imports**

Update imports in the test files to reference the new component location.

## Migration Verification Checklist

Before considering a component fully migrated, verify:

- [ ] Component file is in the correct category directory
- [ ] All imports are updated to correct relative paths
- [ ] Legacy types are replaced with consolidated types
- [ ] CSS files are moved to the same directory as the component
- [ ] Tests are updated and passing
- [ ] Component renders correctly in the application
- [ ] No console errors related to the migration

## Example: Migrating SessionsPage

Here's an example of migrating the SessionsPage component:

### 1. Identify the component type

SessionsPage is a page component for session tracking, so it belongs in the `sessions` category.

### 2. Create the new file

Create `src/react-app/components/sessions/SessionsPage.tsx`

### 3. Copy content and update imports

```typescript
// src/react-app/components/sessions/SessionsPage.tsx

// OLD imports
import React, { useState, useEffect } from 'react';
import { Session } from '../types/session';
import { fetchSessions } from '../utils/api';

// NEW imports
import React, { useState, useEffect } from 'react';
import { TrackingSession } from '../../../types';
import { fetchSessions } from '../../../utils/api';

// Component implementation
function SessionsPage() {
  const [sessions, setSessions] = useState<TrackingSession[]>([]);
  
  // ...rest of component
}

export default SessionsPage;
```

### 4. Update App.tsx or router references

```typescript
// src/react-app/App.tsx

// OLD import
import SessionsPage from './components/SessionsPage';

// NEW import
import SessionsPage from './components/sessions/SessionsPage';
```

## Common Issues During Migration

- **Relative Path Errors**: Double-check the number of `../` in imports
- **Type Mismatches**: Check for properties that may have changed names
- **CSS Styling Issues**: Verify CSS selectors still apply correctly
- **Test Failures**: Update test imports and mocks to match new structure 