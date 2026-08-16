# Handoff package manifest

## Upload to GitHub

Upload everything in this project except files ignored by `.gitignore`। Important committed items:

- `src/`, `public/`, `api/`, `supabase/`, `scripts/`, `docs/`
- `package.json`, `package-lock.json`
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `vercel.json`
- `.env.example`, `.env.rls-test.example`, `.gitignore`
- `README.md`, `START_HERE_BN.md`, `AI_HANDOFF.md`, `DESIGN_SYSTEM.md`

## Never upload

- `.env`, `.env.rls-test`
- `node_modules/`, `dist/`
- Supabase service-role keys, Vercel tokens, test-user passwords

## Supabase files

| Order | File | Purpose |
|---:|---|---|
| 1 | `00_base_schema.sql` | Base hospital content tables |
| 2 | `01_multi_tenant_migration.sql` | Tenants, tenant columns, analytics, storage, indexes |
| 3 | `02_rls_policies.sql` | RLS, helper functions, onboarding RPC, storage access |
| 4 | `03_bootstrap_super_admin.example.sql` | First super-admin role after UUID replacement |

## Package health at handoff

- `npm test`: 6 tests pass
- `npm audit`: 0 vulnerabilities
- `npm run build`: zero error/warning
