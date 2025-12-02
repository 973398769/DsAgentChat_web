# DsAgentWeb

A Vue 3 + TypeScript single-page application for interacting with an AI assistant over chat and reasoning APIs.

## Features

- Modern Vue 3 SPA built with Vite and TypeScript
- Login / registration flow with client-side validation
- Token-based authentication integrated with backend APIs
- Chat, reasoning, and search endpoints streamed via `fetch` and readable streams
- State management with Pinia
- Routing with Vue Router
- Axios wrapper for HTTP requests

## Tech Stack

- **Framework:** Vue 3
- **Language:** TypeScript
- **Build Tool:** Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **HTTP Client:** Axios
- **Markdown & Sanitization:** markdown-it, dompurify

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- pnpm / npm / yarn (any one package manager)

### Install Dependencies

From the project root:

```bash
# using npm
npm install

# or using yarn
yarn install

# or using pnpm
pnpm install
```

### Development Server

Start the Vite dev server:

```bash
npm run dev
# or: yarn dev
# or: pnpm dev
```

By default Vite runs on `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
# or: yarn build
# or: pnpm build
```

The compiled assets will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or: yarn preview
# or: pnpm preview
```

## Project Structure

Key files and directories:

- `src/main.ts` – App entry point
- `src/App.vue` – Root component
- `src/router/index.ts` – Application routes
- `src/stores/user.ts` – User/auth store
- `src/services/api.ts` – Chat / reasoning / search / auth API helpers
- `src/services/axios.ts` – Axios instance configuration
- `src/views/Login.vue` – Login & registration page
- `src/views/Home.vue` – Main chat interface
- `src/components/MessageBox.vue` – Reusable message modal component
- `src/utils/crypto.ts` – Client-side SHA-256 helper

## Environment Variables

The frontend expects a base URL for the backend APIs:

- `VITE_API_BASE_URL` – Base URL for chat / reasoning / search endpoints (e.g. `https://api.example.com`)

Create a `.env.local` file (or similar) in the project root if needed:

```bash
VITE_API_BASE_URL=https://api.example.com
```

## Authentication Flow

- Users can **register** with username, email, and password.
- Passwords are hashed on the client using SHA-256 before being sent to the backend.
- On successful login, an access token is stored in `localStorage`.
- Protected API calls include this token via the Axios instance.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run type-check` – Run TypeScript + Vue type checking

## License

This project is currently private and does not specify a public license.
