# CodeU — Online Academy Platform

A production-ready SaaS online academy platform built with Next.js 16, Supabase, and a feature-based architecture.

## Tech Stack

| Category       | Technology                                                   |
| -------------- | ------------------------------------------------------------ |
| **Framework**  | Next.js 16 (Turbopack, App Router, Server Actions)           |
| **Language**   | TypeScript (strict mode)                                     |
| **Styling**    | Tailwind CSS v4 + tw-animate-css                             |
| **UI Library** | shadcn/ui v4 (base-nova style, @base-ui/react primitives)    |
| **State Mgmt** | Zustand (global state) + TanStack React Query (server state) |
| **Auth**       | Supabase SSR (email/password, Google OAuth)                  |
| **Database**   | Supabase PostgreSQL + Row-Level Security                     |
| **Forms**      | React Hook Form + Zod validation                             |
| **Linting**    | ESLint 9 flat config + Prettier                              |
| **Git Hooks**  | Husky + lint-staged                                          |
| **CI/CD**      | GitHub Actions (typecheck, lint, build)                      |
| **Deployment** | Vercel                                                       |

## Architecture

### Feature-Based Folder Structure

```
src/
├── app/                    # Next.js App Router (route groups + pages)
│   ├── (marketing)/        #   Public pages (landing, about, contact, pricing)
│   ├── (auth)/             #   Auth pages (login, register, forgot-password)
│   ├── (dashboard)/        #   Authenticated learner dashboard
│   └── (admin)/            #   Admin panel
├── components/
│   ├── common/             #   Shared UI (Logo, EmptyState, etc.)
│   ├── layout/             #   Shell components (Navbar, Footer, Sidebar)
│   └── ui/                 #   shadcn/ui primitives (Button, Input, Card, etc.)
├── config/                 #   Zod-validated environment variables
├── features/               #   Domain modules (feature-based)
│   ├── auth/               #     Authentication
│   ├── courses/            #     Course catalog & management
│   ├── lessons/            #     Lesson content & progress
│   ├── enrollments/        #     Enrollment & access control
│   ├── categories/         #     Category taxonomy
│   ├── reviews/            #     Ratings & reviews
│   ├── orders/             #     Purchase & order history
│   ├── payments/           #     Payment integration
│   ├── quizzes/            #     Assessments & quizzes
│   ├── certificates/       #     Certificate generation
│   ├── admin/              #     Admin dashboards & management
│   ├── notifications/      #     In-app & email notifications
│   └── search/             #     Search functionality
│   └── ... each with: components/ hooks/ services/ types/ schemas/ utils/
├── lib/
│   ├── supabase/           #   Supabase SSR clients (client, server, middleware)
│   └── utils.ts            #   cn() utility
├── providers/              #   React context providers (Query, Theme, Toaster)
└── stores/                 #   Zustand stores
```

### Route Groups

| Group         | Path                                      | Auth Required              |
| ------------- | ----------------------------------------- | -------------------------- |
| `(marketing)` | `/`, `/about`, `/contact`, `/pricing`     | No                         |
| `(auth)`      | `/login`, `/register`, `/forgot-password` | No (redirect if logged in) |
| `(dashboard)` | `/dashboard/*`                            | Yes                        |
| `(admin)`     | `/admin/*`                                | Yes + admin role           |

### Auth Flow

- Middleware (`proxy.ts`) checks session on every request.
- Unauthenticated users accessing `/dashboard/*` or `/admin/*` are redirected to `/login`.
- Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.
- Three isolated Supabase clients: browser (client.ts), server (server.ts), proxy (middleware.ts).

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (free tier works)

### Setup

```bash
# Clone the repository
git clone https://github.com/omarhassan1406/codeu.git
cd codeu

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable                        | Required | Description                |
| ------------------------------- | -------- | -------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous API key |

## Scripts

| Command                | Description                      |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start development server         |
| `npm run build`        | Production build                 |
| `npm run start`        | Start production server          |
| `npm run lint`         | Run ESLint                       |
| `npm run lint:fix`     | Run ESLint with auto-fix         |
| `npm run format`       | Format all files with Prettier   |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck`    | Run TypeScript type checking     |

## Deployment

The project is configured for one-command deployment on Vercel.

1. Push to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables in Vercel dashboard.
4. Deploy.

The included `vercel.json` adds security headers (CSP, X-Frame-Options, etc.) automatically.

## Design System

- **Brand Color:** Electric Orange (#FF5500) — available as Tailwind classes `bg-brand-*`, `text-brand-*`, etc.
- **Dark Mode:** Default; toggle via `next-themes`.
- **RTL Support:** Logical CSS properties used throughout.
- **Typography:** Inter font family (Tailwind default).
