# HR Booking — Client

Frontend for the HR consultation booking platform. Built with React 19, TypeScript, Vite, TanStack Query, Zustand, Tailwind CSS, and shadcn/ui-style components.

## Status

Phase 1 (Foundation) — Vite + React + TypeScript scaffold with:

- React Router (data router)
- TanStack Query provider (server state)
- Zustand store (client state)
- Tailwind CSS v4 theme + shadcn-style UI primitives (Button, Card, Input, Badge, Skeleton)
- Axios API client with credentials + unified error handling
- ESLint + Prettier (strict)
- Dockerfile (nginx multi-stage) + GitHub Actions CI

## Tech Stack

- React 19 / TypeScript (strict)
- Vite 8
- React Router 7
- TanStack Query 5
- Zustand 5
- Tailwind CSS 4 + shadcn/ui conventions
- Axios

## Project Structure

```
client/
├── src/
│   ├── app/          # Router, providers
│   ├── components/   # ui/ primitives, shared/ components
│   ├── features/     # Feature modules (later phases)
│   ├── hooks/        # Custom hooks
│   ├── layouts/      # Root layout
│   ├── lib/          # env, utils (cn)
│   ├── pages/        # Route pages
│   ├── services/     # API client
│   ├── stores/       # Zustand stores
│   ├── types/        # Client-side types
│   └── utils/        # Shared helpers
├── public/
├── Dockerfile
├── nginx.conf
└── .env.example
```

## Prerequisites

- Node.js 22+
- npm

## Installation

```bash
npm install
cp .env.example .env   # optional; defaults proxy to the backend in dev
```

## Development

```bash
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` and `/health` to the backend at `http://localhost:5000`.

## Scripts

| Script              | Description                   |
| ------------------- | ----------------------------- |
| `npm run dev`       | Start Vite dev server         |
| `npm run build`     | Type-check + production build |
| `npm run preview`   | Preview the production build  |
| `npm run lint`      | ESLint                        |
| `npm run typecheck` | TypeScript strict type check  |
| `npm run format`    | Prettier write                |

## Docker

```bash
docker build -t hr-booking-client .
docker run -p 8080:80 hr-booking-client
```

In the full stack (see the `server` repo's docker-compose), the client is served by nginx with `/api` proxied to the backend.

## Testing

Component/E2E test tooling (Vitest + Playwright) is added in later phases.

## License

Private.
