# better-auth-mercadopago

This file provides context about the project for AI assistants.

## Project Overview

- **Ecosystem**: Typescript

## Tech Stack

- **Runtime**: none
- **Package Manager**: bun

### Frontend

- Framework: next
- CSS: tailwind
- UI Library: shadcn-ui

### Backend

- Framework: self
- Validation: zod

### Database

- Database: postgres
- ORM: prisma

### Authentication

- Provider: better-auth

### Additional Features

- Testing: vitest-playwright
- AI: vercel-ai

## Project Structure

```
better-auth-mercadopago/
├── apps/
│   ├── web/         # Frontend application
├── packages/
│   ├── auth/        # Authentication
│   └── db/          # Database schema
```

## Common Commands

- `bun install` - Install dependencies
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun test` - Run tests
- `bun db:push` - Push database schema
- `bun db:studio` - Open database UI

## Maintenance

Keep CLAUDE.md updated when:

- Adding/removing dependencies
- Changing project structure
- Adding new features or services
- Modifying build/dev workflows

AI assistants should suggest updates to this file when they notice relevant changes.
