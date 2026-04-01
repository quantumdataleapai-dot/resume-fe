# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
npm start          # Dev server via craco (craco start)
npm run build      # Production build via craco (craco build)
npm test           # Run tests via craco (craco test)
```

No linter CLI command is configured separately — ESLint runs through `react-app` preset (configured in package.json `eslintConfig`). Craco wraps Create React App for custom webpack overrides (see `craco.config.js`).

## Architecture

**React 18 SPA** (JavaScript, not TypeScript) that serves as the frontend for IntelliHire, an AI-powered recruitment platform. The backend is a separate Python API — this repo is frontend only.

### API Integration

- All backend calls go through `src/services/apiService.js` (Axios client with interceptors for JWT auth)
- Endpoint paths are centralized in `src/config/apiConfig.js`
- **The base URL is hardcoded** in both `apiService.js` and `apiConfig.js` to `http://10.30.0.104:8010/api`, overriding `.env` values
- A mock data layer exists via `src/services/mockApiService.js` controlled by `REACT_APP_USE_MOCK_DATA`

### Authentication & Routing

- `src/utils/AuthContext.js` — React Context provider managing auth state, JWT token, and user role via localStorage
- `src/App.js` — Route definitions with two guard components:
  - `ProtectedRoute` — requires authentication
  - `AdminRoute` — requires authentication + admin role
- Admin-only pages: UsersRoles, PendingUsers, DataConnectors
- All-user pages: DashboardHome, DashboardNew (resume matcher), ResumeDatabase

### Key Libraries

- **framer-motion** — login page animations and transitions
- **mammoth** — client-side DOCX text extraction
- **jszip** — bulk resume download as ZIP
- **ajv** — JSON schema validation (data connectors)
- **axios** — HTTP client with request/response interceptors

### Styling

Pure CSS files in `src/styles/` — no CSS-in-JS or preprocessor. Each page has a corresponding CSS file. Light theme with glass-morphism effects.

## Important Patterns

- Pages are in `src/pages/`, reusable components in `src/components/`, API layer in `src/services/`
- File uploads use `FormData` with `files` as the field name
- Resume matching is done via unified endpoints (`/jobs/process-text-and-match`, `/jobs/process-file-and-match`) that combine JD processing + matching in one call
- Data connectors support 6 source types: SQL (PostgreSQL/MySQL), MongoDB, REST APIs, Monster, Dice, Ceipal ATS
