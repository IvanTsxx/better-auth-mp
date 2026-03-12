# Project Structure Template

Enforce this structure for new projects or refactors to maintain the Scope Rule and Screaming Architecture.

```text
src/
  app/
    (auth)/                 # Feature Group: Auth
      login/page.tsx
      _components/          # LOCAL components (Scope Rule)
        login-form.tsx      # Only used in login page
      _actions/             # LOCAL server actions
        auth.ts             # Auth-specific actions
    (dashboard)/            # Feature Group: Dashboard
      dashboard/page.tsx
      _components/
        stats-card.tsx      # Only used in dashboard
    layout.tsx
    page.tsx
  shared/                   # GLOBAL Scope (Used by 2+ features)
    components/
      ui/                   # Generic UI (Button, Card, Input)
      main-nav.tsx          # Shared navigation across features
    lib/
      db.ts                 # Shared database connection
      utils.ts              # Shared utilities
```

## Key Principles applied here

1. **Scope Rule**: Things used in one feature stay in that feature folder (`_components`, `_actions`). Things used in multiple features go to `shared/`.
2. **Screaming Architecture**: Top-level folders like `(auth)` and `(dashboard)` clearly state what the app does.
3. **App Router**: Using `app/` directory and file conventions (`page.tsx`, `layout.tsx`).
