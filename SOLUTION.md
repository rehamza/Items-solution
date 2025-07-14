# Take‑Home Assessment Solution

## Summary

This project implements a full-stack item catalog app with a Node.js backend and React frontend. The assignment required fixing intentional issues and optimizing performance, UX, and error handling.

---

## Backend (Node.js / Express)

### Non-Blocking I/O

- Replaced all `fs.readFileSync` and callback-based `fs.readFile` with `fs.promises.readFile` to ensure non-blocking I/O for `/api/items` and `/api/stats`.

---

### Performance Optimization – `/api/stats`

- Introduced in-memory caching for `/api/stats` using `fs.stat` to detect when the underlying `items.json` file is modified.
- Future-ready: this can be easily replaced with Redis or file watchers (e.g. `chokidar`) if persistence and multi-instance support are required.

---

### Pagination + Server-side Search

- Enhanced `/api/items` to support:
  - `q`: search term
  - `limit`: items per page
  - `page`: pagination index
  - Returns `{ items, total, page, limit }` to support frontend navigation

---

### Error Handling

- Added centralized `genericErrorHandler` middleware with:
  - `err.status` fallback to `500`
  - JSON error responses for clarity
- Route-level validation for invalid `id` values and missing payloads
- All async routes use `try/catch` and forward errors via `next(err)`

---

### Unit Tests

- Implemented Jest + Supertest test cases covering:
  - GET /api/items
  - GET /api/items?q=
  - GET /api/items/:id (200 + 404)
  - POST /api/items
- Each test checks both happy path and error conditions

---

## Frontend (React)

### Virtualized List

- Used `react-window` and `react-virtualized-auto-sizer` to render large lists efficiently

### Debounced Search

- Used `lodash.debounce` (400ms) on the search input to prevent frequent backend calls
- Preserves user input experience while reducing API load

### Pagination Support

- Controlled via `page` state and driven by backend `limit`/`page`
- Next/Previous buttons are disabled accordingly

### UX Improvements

- Replaced plain `<p>Loading...` with `react-loading-skeleton` for smoother transitions
- Removed horizontal scrolling and applied consistent responsive layout

---

## Trade-Offs & Future Enhancements

| Feature             | Decision & Rationale                                  |
|---------------------|--------------------------------------------------------|
| File-based storage  | Simplified for testability; Redis or DB preferred     |
| In-memory cache     | Suitable for single-instance demo; Redis for scale    |
| Validation          | Used manual checks; can upgrade to Zod or Joi         |
| Pagination accuracy | No `totalPages` yet; easy to add using `Math.ceil`    |

---

## To Run

### Backend

```bash
cd backend
npm install
npm run dev
