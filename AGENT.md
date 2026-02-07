# TrackFootball.app Agent Instructions

## Development

The app is running at https://trackfootball.localhost. Do not attempt to run it, I will run it for you. If you find that the app is not running tell me to run it. You should already be logged in on this domain.

## Commands

- **Dev**: `pnpm run dev` (starts Next.js app)
- **Build**: `pnpm run build` (builds all packages)
- **Test**: `pnpm run test` (runs all tests), `pnpm --filter @trackfootball/sprint-detection test` (single package test)
- **Lint**: `pnpm run lint` (TypeScript check all packages), `pnpm --filter <package> lint` (single package)
- **Release**: `pnpm run release` (deploys rw-app to Cloudflare Workers)

## Architecture

- **Monorepo** with pnpm workspaces, packages in `packages/`
- **Main app**: `rw-app` (React + Cloudflare Workers + Vite)
- **Database**: PostgreSQL with custom functions (see README.md SQL section)
- **Key packages**: `service` (business logic), `sprint-detection` (GPS analysis), `postgres` (DB layer)
- **Testing**: Vitest for unit tests (`packages/sprint-detection/__tests__/`)

## Code Style

- **TypeScript**: Strict mode, ES2021+, React JSX
- **Prettier**: Single quotes, no semicolons, custom import order (@core, @server, @ui, relative)
- **Imports**: Use workspace aliases `@trackfootball/*`, path aliases `@/*` for src
- **Conventions**: Use `tiny-invariant` for assertions, `ts-pattern` for pattern matching
- **Types**: Handwritten in `@trackfootball/postgres` using zod schemas with inferred TypeScript

IMPORTANT Follow the functional core. Most 'inner' code should be stateless with a thin imperative layer at the boundaries.

## Refactoring

Many tasks will involve refactoring, whenever you do that, do not make too many changes at once. Focus on the primary task, if you have to change another place, ask first and use a TODO to "mark" a part of the existing codebase as something that would need refactor.

Remember to follow the functional core, imperative shell principle. Most 'inner' code should be stateless with a thin imperative layer at the boundaries.
