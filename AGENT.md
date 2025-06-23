# TrackFootball.app Agent Instructions

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
- **Key packages**: `service` (business logic), `sprint-detection` (GPS analysis), `postgres` (DB layer), `kanel` (type generation)
- **Testing**: Vitest for unit tests (`packages/sprint-detection/__tests__/`)

## Code Style
- **TypeScript**: Strict mode, ES2021+, React JSX
- **Prettier**: Single quotes, no semicolons, custom import order (@core, @server, @ui, relative)
- **Imports**: Use workspace aliases `@trackfootball/*`, path aliases `@/*` for src
- **Conventions**: Use `tiny-invariant` for assertions, `ts-pattern` for pattern matching
- **Types**: Generate from DB with kanel, strict TypeScript everywhere
