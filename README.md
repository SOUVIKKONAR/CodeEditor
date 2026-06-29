# IntelliCode

AI-assisted code editor built with React, Monaco Editor, and an Express backend.

## Run the app

Install frontend dependencies from the project root:

```bash
npm install
npm start
```

Install and start the backend from `server/`:

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Then edit `server/.env` and set your private OpenAI key:

```env
OPENAI_API_KEY=your_api_key_here
```

The React app runs on `http://localhost:3000` and calls the API at `http://localhost:5000/api` by default. Override that with `REACT_APP_API_URL` if your backend is hosted elsewhere.

## API routes

- `GET /api/health` checks the backend status.
- `POST /api/debug` debugs submitted code.
- `POST /api/explain` explains submitted code.
- `POST /api/optimize` suggests improvements.
- `POST /api/ai` accepts `{ "action": "debug" | "explain" | "optimize", "code": "..." }`.

Each POST route accepts:

```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}
```

Responses return:

```json
{
  "action": "explain",
  "result": "..."
}
```