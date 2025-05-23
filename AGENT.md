# AGENT.md - Guidelines for AI Coding Agents

## Project Structure

This is a monorepo using Bun workspace with the following packages:
- `packages/next-js-app/` - Main Next.js application (runs on port 6060)
- `packages/database/` - Database utilities and Prisma client
- `packages/open-api/` - OpenAPI specifications
- `packages/sprint-detection/` - Sprint analysis algorithms
- `packages/unit-utils/` - Utility functions

## Important Notes

- The build is running and has hot reload build in. You don't have to suggest `bun run build` and `bun run dev` in the chat.
- Main app runs on port 6060 (`next dev -p 6060`)
- Uses Bun as package manager and runtime

## Commands

- **Build**: `bun run build` (from next-js-app directory)
- **Dev**: `bun run dev` (from next-js-app directory) - starts on port 6060
- **Lint**: `bun run lint` (includes TypeScript check + ESLint)
- **Test**: `bun test` (from next-js-app directory)
- **Type Check**: `bun tsc --noEmit`
- **Run single test**: `bun test path/to/test.ts`

## Code Style

- **Formatting**: Use Prettier with single quotes, no semicolons
- **Imports**: Sorted using importOrder pattern in .prettierrc.json
  - Import order: `@core/(.*)$`, `@server/(.*)$`, `@ui/(.*)$`, then relative imports
  - Imports are separated and sorted with specifiers
- **Types**: Use TypeScript with strong typing, avoid `any`. Never use `@ts-ignore`, use `@ts-expect-error` with helpful messages
- **Error Handling**: Try/catch with appropriate fallbacks, use `tiny-invariant` for assertions
- **Components**: React functional components with TypeScript interfaces
- **Naming**:
  - PascalCase for components, interfaces, types
  - camelCase for variables, functions
  - Descriptive names preferred
- **Framework**: Next.js 14 app router with TypeScript, Tailwind CSS
- **State Management**: React hooks with TypeScript
- **Pattern Matching**: Use `ts-pattern` for complex conditional logic
- **Database**: Uses Prisma with PostgreSQL

## Key Dependencies

- **UI**: MUI (Material-UI) components, Tailwind CSS
- **Database**: Prisma, PostgreSQL (via `postgres` package)
- **Auth**: Auth0 NextJS SDK
- **Maps**: Mapbox GL, react-map-gl
- **Utils**: date-fns, zod for validation, tiny-invariant
- **Geospatial**: Turf.js for geographic calculations
- **Runtime**: Bun for package management and testing

## File Structure Patterns

- API routes: `app/api/*/route.ts` (Next.js app router)
- Components: `components/` directory
- Services: `services/` directory for business logic
- Utils: `utils/` directory for shared utilities
- Database functions: imported from `@trackfootball/database`
