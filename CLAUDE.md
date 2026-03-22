# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Kanka-Foundry is a Foundry VTT module that integrates with [Kanka.io](https://kanka.io) to import worldbuilding entities as journal entries. It's a TypeScript project using Vite for building, Handlebars for templating, and Tailwind CSS for styling.

## Build & Development Commands

- `npm ci` — install dependencies (use instead of `npm install`)
- `npm run build` — production build (output in `dist/`)
- `npm start` — Vite dev server with HMR (NODE_ENV=development)
- `npm run check` — run both type checking and linting (**must pass before committing**)
- `npm run check:types` — TypeScript type checking only
- `npm run check:lint` — Biome linting only
- `npm test` — run tests with Vitest
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage

### Docker Dev Workflow

1. Copy `secrets.json.dist` to `secrets.json` and fill in credentials
2. `npm run build` (initial build)
3. `docker compose up` (runs Foundry VTT)
4. `npm start` (Vite dev server at http://localhost:3000)

## Architecture Overview

```
Kanka API → KankaApi/KankaFetcher (src/api/)
  → TypeLoaders (src/api/typeLoaders/) — one per entity type
  → Foundry integration (src/foundry/) — creates/updates journal entries
  → UI Apps (src/apps/) — browser, settings
  → Handlebars templates (src/handlebars/) — rendering journal pages
```

### Key Concepts

- **Entity types** (Character, Location, Organisation, etc.) each have a dedicated `TypeLoader` extending `AbstractTypeLoader` in `src/api/typeLoaders/`
- **ReferenceCollection** (`src/api/ReferenceCollection.ts`) manages cross-entity links and resolves references between imported entities
- **RateLimiter** (`src/api/RateLimiter.ts`) throttles API requests to stay within Kanka's rate limits (30/min free, 90/min subscribers)
- **syncEntities** (`src/syncEntities.ts`) orchestrates the import/update flow
- **Migrations** (`src/migrations/`) handle data format changes between module versions

### Localization

- YAML-based i18n files in `src/lang/` (en, de, it, pt_BR)
- Community translations managed via [Weblate](https://weblate.foundryvtt-hub.com/engage/kanka-foundry/)

## Kanka API Reference

When working with Kanka entity types, endpoints, or data structures, consult the official API documentation:
**https://app.kanka.io/api-docs/1.0/overview**

### Live API Access

A `KANKA_TOKEN` environment variable is available for authenticating against the Kanka API. Use it to verify actual API responses when unsure about field names, types, or structure:

```bash
curl -s -H "Authorization: Bearer $KANKA_TOKEN" -H "Accept: application/json" \
  "https://api.kanka.io/1.0/campaigns/44342" | jq .
```

Always verify response shapes against real API data rather than relying solely on documentation.

## Code Quality

- **Linter**: Biome (not ESLint) — config in `biome.json`
- **TypeScript**: strict mode enabled
- **Tests**: Vitest — test files are co-located with source (`*.test.ts`)
- **Formatting**: Prettier
- Always run `npm run check` before committing

## Commit Guidelines

- Do **NOT** add "Co-Authored-By" lines referencing Claude, AI, or any AI tool
- Do **NOT** mention Claude, AI, or any AI tool in commit messages
- Write commit messages as if authored by the developer
- The responsibility for any commit lies solely with the developer
- Follow [Conventional Commits](https://www.conventionalcommits.org/) style (the project uses semantic-release)
