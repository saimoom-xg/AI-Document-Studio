import { NextResponse } from 'next/server';
import { documentRegistry } from '@/lib/documents/registry';
import type { DocumentType } from '@/lib/documents/types';

export const runtime = 'nodejs';

const supportedTypes = Object.keys(documentRegistry).filter((type) => type !== 'unknown');

function parseJson(content: string) {
  const cleaned = content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as { type?: string; confidence?: number; data?: Record<string, unknown> };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { fileName?: string; text?: string };
    const fileName = body.fileName || 'uploaded-document';
    const text = (body.text || '').slice(0, 24000);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Gracefully signal to client to use client-side heuristic parser
      return NextResponse.json({
        fallback: true,
        message: 'OpenRouter API key not configured; using local heuristic extraction.',
      });
    }

    const prompt = `You are an expert document analysis AI. Analyze the uploaded document and return only valid JSON matching this schema:
{
  "type": "<one of: ${supportedTypes.join(', ')}>",
  "confidence": <number between 0.0 and 1.0>,
  "data": {
    <appropriate extracted fields for this document type, such as items array with description, quantity, unitPrice, total for invoices/receipts/quotes/orders; fullName, jobTitle, summary, skills, experience array, education array for CV/resumes; title, author, summary, sections array for reports; employee, expenses array for expense reports>
  }
}

Filename: ${fileName}
Content:
${text || '[No text could be extracted in the browser]'}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Document Studio',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'openrouter/free',
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ fallback: true, error: 'AI analysis unavailable' });
    }

    const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ fallback: true, error: 'Empty AI response' });
    }

    const parsed = parseJson(content);
    const type = (parsed.type && Object.prototype.hasOwnProperty.call(documentRegistry, parsed.type))
      ? (parsed.type as DocumentType)
      : 'unknown';
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.85));

    return NextResponse.json({
      type,
      confidence,
      data: parsed.data && typeof parsed.data === 'object' ? parsed.data : {},
    });
  } catch {
    return NextResponse.json({ fallback: true, error: 'Analysis exception' });
  }
}

