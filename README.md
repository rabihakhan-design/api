# Placeholder Dashboard

React + Vite + Tailwind CSS dashboard powered by the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) REST API.

## Setup
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```
The API base URL lives in `.env` (`VITE_API_BASE_URL`). Copy `.env.example` if `.env` is missing.

## Structure
`src/services/api.js` (all API calls, GET caching) · `src/hooks/useFetch.js` · `src/components/` (Layout, shared UI, toasts, modals) · `src/pages/` (Dashboard, Users, Posts, Comments, Albums, Todos)

## Endpoints used
| Resource | Requests |
|---|---|
| Users | GET /users, GET /users/1, POST /users |
| Posts | GET /posts, GET /posts/1, GET /posts?userId=1, POST /posts, PUT /posts/:id, DELETE /posts/:id |
| Comments | GET /comments, GET /posts/1/comments, POST /posts/:id/comments |
| Albums & Photos | GET /albums, GET /photos |
| Todos | GET /todos, GET /todos?userId=1, POST /todos, PATCH /todos/:id, DELETE /todos/:id |

JSONPlaceholder is a mock API: POST/PUT/PATCH/DELETE return success but are not saved. The UI updates local React state after each successful response. Items created in the UI are marked local and are not sent to the server again when edited or deleted (the mock API has no record of them).

## Deploy
**GitHub:** `git init && git add . && git commit -m "Initial commit"`, create a repo, then `git remote add origin <url> && git push -u origin main`.
**Vercel:** import the GitHub repo at vercel.com/new (Vite preset is auto-detected), add env var `VITE_API_BASE_URL=https://jsonplaceholder.typicode.com`, click Deploy. `vercel.json` handles SPA routing.
