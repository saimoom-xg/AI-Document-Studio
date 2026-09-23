# AI Document Studio

Anonymous, browser-first document editing for Vercel.

## How it works

- No database, login, API routes, or server-side storage.
- Uploads are kept temporarily in the browser's `sessionStorage`.
- Edit the extracted draft in the browser.
- Export PDF or Excel locally with `jsPDF` and `xlsx`.
- Closing the browser session or clearing site data removes the temporary document.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Connect the repository to Vercel and use the default settings. The build runs `next build` with `output: 'export'`, so no environment variables or database are required.

The browser-only flow intentionally does not provide durable storage or server-side extraction. Keep uploaded files below the 15MB limit shown in the upload screen.