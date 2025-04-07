# Deprecation Directory

This directory contains components, modules, and systems that are being phased out as part of the new ecosystem integration. These items are kept here for reference and to support gradual migration.

## Deprecation Timeline

| Component | Current Status | Sunset Date | Replacement |
|-----------|---------------|-------------|-------------|
| Legacy Auth System | In Use | Q3 2024 | Kush.Observer Auth |
| V1 Analytics | In Use | Q3 2024 | New Analytics Dashboard |
| Local Storage Sessions | In Use | Q4 2024 | D1 Database |

## Migration Steps

### Legacy Auth to Kush.Observer

1. Add Kush.Observer client integration
2. Run both auth systems in parallel with feature flags
3. Migrate users to new system
4. Remove legacy auth code

### V1 Analytics to New System

1. Create data export utilities
2. Set up new analytics with D1 database
3. Run parallel analytics for validation
4. Switch to new system exclusively

## Code Ownership

All deprecated code is marked with `@deprecated` tags and should not be modified except for critical security fixes. Any questions about deprecated components should be directed to the migration team.

## File Structure

- `/legacy-auth` - Old authentication system
- `/v1-analytics` - Previous reporting engine 