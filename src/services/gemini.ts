import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeContract(fileData: string, mimeType: string) {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileData, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to analyze contract');
  }

  return response.json();
}

export async function chatAboutContract(history: any[], fileData?: string, mimeType?: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, fileData, mimeType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get response from Coach');
  }

  const data = await response.json();
  return data.text;
}

