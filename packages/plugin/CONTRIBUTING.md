# Contributing to better-auth-mercadopago

> 🇦🇷 **¿Preferís leer esto en español?** → [CONTRIBUTING.es.md](./CONTRIBUTING.es.md)

Thank you for your interest in contributing! This document explains the technical setup and conventions you need to know to contribute effectively.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Workflow: How to Contribute](#workflow-how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Changesets: Versioning & Changelogs](#changesets-versioning--changelogs)
- [Release Process](#release-process)
- [Getting Help](#getting-help)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Harassment, discrimination, or disrespectful behavior will not be tolerated.

---

## Architecture Overview

This project is a **Turborepo monorepo** with Bun as the package manager. The publishable package lives in `packages/plugin`. The rest of the monorepo (`apps/`, other `packages/`) is infrastructure for development and documentation.

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
bun add better-auth
```

The plugin is **ORM-agnostic** — it supports Prisma, Drizzle, or any other ORM/database compatible with Better Auth. The required schema is generated via the Better Auth CLI (`bunx @better-auth/cli generate`).

```
better-auth-mercadopago/
├── .changeset/          # Changesets configuration
├── .github/workflows/   # CI/CD (ci.yml, release.yml)
├── apps/
│   ├── fumadocs/        # Documentation site (Fumadocs)
│   └── web/             # Demo web app (Next.js 15)
├── packages/
│   ├── auth/            # Shared Better Auth configuration
│   ├── config/          # Shared TypeScript/lint config
│   ├── db/              # Prisma database schema & migrations
│   ├── env/             # Shared environment variable validation (Zod)
│   └── plugin/          # ← THE PUBLISHABLE PACKAGE (better-auth-mercadopago)
├── turbo.json           # Turborepo pipeline
└── package.json         # Root (private, tooling only)
```

### The Plugin Package (`packages/plugin`)

The plugin follows **Better Auth's plugin pattern**:

- **`src/index.ts`** — Server plugin (exported as `better-auth-mercadopago`)
- **`src/client-plugin.ts`** — Client plugin (exported as `better-auth-mercadopago/client`)
- **`src/types.ts`** — Shared TypeScript types (exported as `better-auth-mercadopago/types`)
- **`src/schemas.ts`** — Zod validation schemas (exported as `better-auth-mercadopago/schemas`)
- **`src/endpoints/`** — Better Auth endpoint handlers
- **`src/security/`** — Webhook signature verification and security utilities

**Build:** `tsup` compiles TypeScript to ESM + CJS with `.d.ts` declaration files into `dist/`.

---

## Development Setup

### Prerequisites

- **Node.js 20+**
- **Bun 1.3+** (install at [bun.sh](https://bun.sh))
- **Docker** (for the PostgreSQL database)
- **Git**

### Steps

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/better-auth-mercadopago.git
cd better-auth-mercadopago

# 2. Install all dependencies
bun install

# 3. Set up environment variables
# Copy the example and fill in your MercadoPago credentials
cp apps/web/.env.example apps/web/.env.local

# 4. Start the database (requires Docker)
bun db:start

# 5. Run database migrations
bun db:migrate

# 6. Start the development environment
bun dev
```

### Environment Variables

For local development on the **plugin** itself, you only need:

```env
# apps/web/.env.local
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx  # Use a TEST token, never production
MP_WEBHOOK_SECRET=any-local-secret
BETTER_AUTH_SECRET=any-local-secret
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/better-auth-mercadopago
```

> ⚠️ **NEVER commit real credentials.** Always use MercadoPago's TEST tokens for development.

---

## Project Structure (Plugin in depth)

```
packages/plugin/
├── src/
│   ├── endpoints/        # Better Auth endpoint handlers
│   │   └── webhook.ts    # Webhook receiver and dispatcher
│   ├── security/         # Security utilities
│   │   └── signature.ts  # MercadoPago webhook signature verification
│   ├── client-plugin.ts  # Client-side plugin definition
│   ├── index.ts          # Server-side plugin definition (main entry)
│   ├── schemas.ts        # Zod schemas for payloads and config
│   └── types.ts          # TypeScript types (inferred from schemas + custom)
├── tsup.config.ts        # Build configuration (tsup)
├── tsconfig.json         # TypeScript config (extends shared config)
├── package.json          # Package manifest
└── README.md             # User-facing documentation
```

### How Better Auth Plugins Work

A Better Auth plugin is a function that receives a context and returns an object with the plugin's capabilities:

```typescript
// Simplified structure
import type { BetterAuthPlugin } from "better-auth";

export const mercadopago = (options: MercadoPagoOptions): BetterAuthPlugin => ({
  id: "mercadopago",
  // Extend the database schema
  schema: {
    mercadoPagoPayment: { fields: { ... } },
    mercadoPagoSubscription: { fields: { ... } },
  },
  // Register HTTP endpoints
  endpoints: {
    mercadopagoWebhook: createAuthEndpoint("/mercadopago/webhook", { ... }),
  },
  // Run code on initialization
  init: (ctx) => { ... },
});
```

---

## Workflow: How to Contribute

### For Bug Fixes or Small Changes

1. Check [existing issues](https://github.com/IvanTsxx/better-auth-mercadopago/issues) to avoid duplicates
2. Create a new issue describing the bug/change
3. Fork, create a branch: `git checkout -b fix/descriptive-name`
4. Make your changes, following the [coding standards](#coding-standards)
5. **Add a changeset** (see [Changesets section](#changesets-versioning--changelogs))
6. Push and open a Pull Request

### For New Features

1. Open a **Discussion** or **issue** first to validate the idea — don't waste your time on something that won't be merged
2. Once approved, follow the same branch + changeset flow

### Branch Naming Convention

```
feat/webhook-refund-handling
fix/subscription-status-update
docs/add-nextjs-example
chore/update-mercadopago-sdk
```

---

## Coding Standards

This project uses **Ultracite** (Oxlint + Oxfmt) for automated formatting and linting.

```bash
# Fix all formatting and lint issues automatically
bun x ultracite fix

# Check without modifying
bun x ultracite check
```

### TypeScript Rules

- **Always explicit types** on function parameters and returns
- **`unknown` over `any`** — never use `any`
- **`const` by default**, `let` only when reassignment is needed
- **Optional chaining** (`?.`) and nullish coalescing (`??`) for safe access
- **Arrow functions** for callbacks and utilities

### File/Module Rules

- No barrel files (`index.ts` that re-exports everything from a folder)
- Prefer specific imports: `import { foo } from "./foo"` over `import * as foo`
- No `console.log` in production code — use proper error handling

### Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add refund endpoint handler
fix: correct webhook signature verification for Brazil region  
docs: update README with subscription example
chore: update mercadopago SDK to 2.4.0
```

> Never add "Co-Authored-By" AI attribution to commits.

---

## Testing

> 🔲 Tests are on the roadmap. Currently, the CI pipeline verifies that the plugin builds and type-checks correctly.

When testing infrastructure is added, tests will live in `packages/plugin/src/__tests__/`. We'll use **Vitest**.

---

## Changesets: Versioning & Changelogs

We use [Changesets](https://github.com/changesets/changesets) for semantic versioning and automated changelogs. **You MUST add a changeset for every contribution that changes plugin behavior or the public API.**

### When to add a changeset

| Type of change | Changeset needed? | Version bump |
|----------------|-------------------|--------------|
| New feature | ✅ Yes | `minor` |
| Bug fix | ✅ Yes | `patch` |
| Breaking change | ✅ Yes | `major` |
| Documentation only | ❌ No | — |
| Internal refactor (no API change) | ❌ No | — |
| CI/tooling changes | ❌ No | — |

### How to add a changeset

```bash
# From the repo root
bun changeset
```

The CLI will ask:
1. **Which packages to include** — always select `better-auth-mercadopago`
2. **Type of change** — `major`, `minor`, or `patch`
3. **Summary** — Write a clear, user-facing description of the change

This creates a `.md` file in `.changeset/`. **Commit this file alongside your code changes.**

Example changeset file (`.changeset/purple-dogs-laugh.md`):
```markdown
---
"better-auth-mercadopago": patch
---

Fix webhook signature verification to correctly handle MercadoPago's HMAC-SHA256 format.
```

---

## Release Process

The release process is **fully automated** via GitHub Actions. You don't need to do anything beyond merging your PR.

### How it works

```
Your PR (with changeset) → Merge to main
        ↓
GitHub Action detects changeset
        ↓
Automatically creates a "Version Packages" PR
(bumps version in package.json, updates CHANGELOG.md)
        ↓
Maintainer reviews and merges the "Version Packages" PR
        ↓
GitHub Action publishes to npm + creates GitHub Release
```

### For Maintainers Only

To trigger a release manually, merge the automated "Version Packages" PR on GitHub. The action handles everything else.

---

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/IvanTsxx/better-auth-mercadopago/discussions)
- **Found a bug?** Open an [Issue](https://github.com/IvanTsxx/better-auth-mercadopago/issues)
- **Security vulnerability?** DO NOT open a public issue. Email directly. (see SECURITY.md when available)
