# AI Document Studio

Anonymous, browser-first document editing for Vercel.

## How it works

- No database, login, or server-side document storage.
- OpenRouter is called through one Vercel serverless analysis route; the API key never reaches the browser.
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

Connect the repository to Vercel and use the default settings. Add `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL` (defaults to `openrouter/free`) in the Vercel project environment variables. Use [.env.example](.env.example) as the clean local configuration template.

The original file and edited document remain temporary in the browser. Only locally extracted text is sent to OpenRouter for detection and structured extraction. Keep uploaded files below the 15MB limit shown in the upload screen.