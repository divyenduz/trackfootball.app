# TrackFootball

Track and visualize your football (soccer) activities using GPS data from Strava.

**[trackfootball.app](https://trackfootball.app)**

## Tech Stack

- **App**: React + [RedwoodSDK](https://rwsdk.com) on Cloudflare Workers
- **Database**: PostgreSQL
- **Language**: TypeScript
- **Monorepo**: pnpm workspaces

## Project Structure

```
packages/
  rw-app/       # Web app (React + Cloudflare Workers + Vite)
  service/      # Business logic (geo processing, Strava integration)
  postgres/     # Database layer
  open-api/     # Generated API client (Kubb)
  cli/          # CLI tools
```

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL

### Setup

```sh
cp .env-sample .env  # configure your environment variables
pnpm install
pnpm run dev
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build all packages |
| `pnpm run test` | Run all tests |
| `pnpm run lint` | Typecheck all packages |
| `pnpm run release` | Deploy to Cloudflare Workers |

## License

MIT
