# 📦 SeshTracker D1 Migrations

This directory contains all Cloudflare D1 database schema and migration files for the SeshTracker ecosystem.

---

## 📂 Structure

| File Name                        | Purpose |
|----------------------------------|---------|
| `0001_initial_schema.sql`        | Original baseline schema (sessions, users, etc.) |
| `0001_create_cannabis_tables.sql`| Cannabis-specific inventory tables (deprecated or merged) |
| `0002_sessions_inventory_schema.sql` | Unified schema update with session & inventory structure |
| `up.sql`                         | Latest full schema (use for testing environments) |
| `down.sql`                       | Rollback script (use with caution) |
| `apply-migration.js`            | Script to apply migrations locally and remotely using Wrangler |

---

## 🔁 Migration Flow

1. **Edit SQL**: Create/update schema in a numbered file (e.g., `0003_add_column_x.sql`)
2. **Apply Locally**:  
   ```bash
   npx wrangler d1 execute seshtracker-db --file=0003_add_column_x.sql
   ```
3. **Apply Remotely (Production/Staging)**:  
   ```bash
   npx wrangler d1 execute seshtracker-db --file=0003_add_column_x.sql --remote
   ```
4. **Scripted Flow** (recommended):  
   ```bash
   node scripts/apply-migration.js
   ```

---

## 🛑 Best Practices

- Use **timestamped or incremented** filenames (`0003_`, `0004_`) to preserve order.
- Never edit applied migrations in-place — always add a new one.
- Validate with Wrangler CLI before pushing to production.
- Use `down.sql` for clean dev resets only.

---

## ✅ Current Schema Highlights

From `0002_sessions_inventory_schema.sql`:
- `sessions`: Tracks title, description, start/end time, method, rating
- `inventory`: Tracks strain, amount, unit, purchase price/date
- `session_inventory`: Junction table to map sessions to inventory usage
- `strains`: Central strain catalog

---

## 🔍 Helpful Commands

```bash
# List applied migrations (D1 CLI)
npx wrangler d1 execute seshtracker-db --command ".tables"

# Check schema
npx wrangler d1 execute seshtracker-db --command ".schema"

# Rollback (if needed)
npx wrangler d1 execute seshtracker-db --file=down.sql
```

---

## 🔧 Tooling
> **ℹ️ Note:** This project uses `wrangler.json` instead of `wrangler.toml`.
> Ensure your `wrangler.json` file includes the correct D1 database bindings:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "seshtracker-db",
      "database_id": "your-d1-database-id"
    }
  ]
}
```


Ensure the following are configured:

- `wrangler.toml` includes your `[[d1_databases]]` block
- DB name matches the environment: `seshtracker-db`
- Migrations stored in `migrations/` directory and version-controlled

