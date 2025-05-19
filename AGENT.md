# AGENT.md - Guidelines for AI Coding Agents

## Commands

- **Build**: `nx run-many --target=build --projects @trackfootball/next-js-app` or `yarn build`
- **Dev**: `nx run-many --target=dev --projects @trackfootball/next-js-app` or `yarn dev`
- **Lint**: `nx run-many --target=lint --projects @trackfootball/next-js-app` or `yarn lint`
- **Test**: `nx run-many --target=test --projects @trackfootball/next-js-app` or `yarn test`
- **Run single test**: `yarn test path/to/test.ts`

## Code Style

- **Formatting**: Use Prettier with single quotes, no semicolons
- **Imports**: Sorted using importOrder pattern in .prettierrc.json
- **Types**: Use TypeScript with strong typing, avoid `any`
- **Error Handling**: Try/catch with appropriate fallbacks (see profile page)
- **Components**: React functional components with TypeScript interfaces
- **Naming**:
  - PascalCase for components, interfaces
  - camelCase for variables, functions
  - Descriptive names preferred
- **Framework**: Next.js app router with TypeScript, Tailwind CSS
- **State Management**: React hooks with TypeScript
