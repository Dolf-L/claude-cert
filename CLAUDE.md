# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps + Prisma client + DB migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Run production server
npm run lint         # ESLint
npm run test         # Run Vitest test suite
npm run db:reset     # Force reset Prisma database
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them via streaming tool calls; results appear instantly in an iframe preview.

### Key Data Flow

1. User types in `ChatInterface` → sends to `/api/chat` with messages + serialized virtual filesystem
2. `/api/chat/route.ts` calls Claude (or MockLanguageModel) via Vercel AI SDK with two tools:
   - `str_replace_editor` — create/modify files
   - `file_manager` — create/delete/list files
3. `chat-context.tsx` intercepts streaming tool call results and updates the virtual filesystem in memory
4. `PreviewFrame.tsx` watches filesystem changes, Babel-transpiles JSX on-the-fly, and hot-reloads the sandboxed `<iframe>`
5. If the user is authenticated + has a projectId, the project (messages + filesystem) is persisted to SQLite via Prisma

### Virtual File System

`/src/lib/file-system.ts` is a pure in-memory tree — files are **never written to disk**. It serializes/deserializes as JSON for DB persistence. The `FileSystemContext` (`/src/lib/contexts/file-system-context.tsx`) wraps it as React state.

### AI Provider Pattern

`/src/lib/provider.ts` exports `getLanguageModel()`. If `ANTHROPIC_API_KEY` is set in `.env`, it returns the real Claude model with ephemeral cache control. Otherwise it returns a `MockLanguageModel` that generates a hardcoded 4-step component. This lets the app run without an API key.

### Live Preview

`PreviewFrame.tsx` compiles the virtual filesystem into an `<iframe srcdoc>` at runtime:
- Babel Standalone transpiles JSX in-browser
- A dynamic import map resolves virtual file paths to blob URLs
- Entry point detection prefers `App.jsx` then `index.jsx`

### Authentication

JWT tokens in httpOnly cookies (7-day expiry). `middleware.ts` protects `/api/projects` and `/api/filesystem`. Passwords hashed with bcrypt. Server actions in `/src/actions/` handle sign-up, sign-in, sign-out, and project CRUD.

### Tech Stack

- **Next.js 15** App Router, **React 19**, **TypeScript 5** (strict, `@/*` aliases to `src/*`)
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI components, New York style)
- **Vercel AI SDK** + **@ai-sdk/anthropic** for streaming generation and tool use
- **Monaco Editor** for code editing, **react-resizable-panels** for layout
- **Prisma 6** + **SQLite** (`prisma/dev.db`) for persistence
- **Vitest** + **@testing-library/react** + **jsdom** for tests

### System Prompt

Claude's generation behavior is controlled by `/src/lib/prompts/generation.tsx`.
