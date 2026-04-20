# SmartPark Frontend (Angular)

This is a scaffolded Angular frontend for the SmartPark project.

Features included:
- Angular + TypeScript project skeleton
- Bootstrap for styling
- AuthService (Bearer token storage in localStorage)
- ApiService (wrapped HTTP calls with Authorization header)
- Role guard for routes
- Placeholder components for User / Officer / Admin views

Quick start

1. From the `smartpark-frontend` directory run:

```bash
npm install
# or: npm ci
```

2. Serve the app (requires @angular/cli installed, either globally or via npx):

```bash
npx ng serve --open
```

3. The app expects the backend API base URL to be in `environment.ts` or set the `API_BASE_URL` in `src/environments/environment.ts`.

Notes

- This is a minimal scaffold. Run `npx @angular/cli new` for a full CLI-generated project if you prefer. The included files are enough to get started and connect to the existing Laravel API (Bearer token flow).
