// import type { AnalysisResult } from "../types";

// const SYSTEM_PROMPT = `You are a principal software engineer, security auditor, and performance specialist. You perform rigorous code review.

// Rules:
// - Return ONLY valid JSON matching this schema:
// {
//   "language": "string",
//   "plainLanguageSummary": "string",
//   "performanceAnalysis": {
//     "timeComplexity": "string",
//     "spaceComplexity": "string",
//     "bottleneck": "string"
//   },
//   "diagnostics": [
//     {
//       "startLine": number,
//       "endLine": number,
//       "severity": "critical" | "warning" | "info",
//       "title": "string",
//       "message": "string",
//       "remediation": "string"
//     }
//   ],
//   "optimizedCode": "string"
// }
// - Do NOT wrap in markdown fences or add explanatory text outside JSON.
// - Line numbers must be 1-indexed and exact.
// - optimizedCode must be the complete, runnable refactored file.`;

// function extractJson(text: string): string {
//   const trimmed = text.trim();
//   const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
//   return fenced ? fenced[1].trim() : trimmed;
// }

// export async function analyzeCode(
//   code: string,
//   filename: string,
//   language: string,
//   signal?: AbortSignal
// ): Promise<{ result: AnalysisResult; modelUsed: string }> {
//   const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

//   if (!apiKey) {
//     throw new Error("Missing VITE_GEMINI_API_KEY in .env.local file.");
//   }

//   const numberedCode = code
//     .split("\n")
//     .map((line, i) => `${i + 1}: ${line}`)
//     .join("\n");

//   const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this ${language} file "${filename}":\n\n${numberedCode}`;

//   // Your project's active model
//   const MODEL_ID = "gemini-3.7-flash";
//   const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`;

//   if (signal?.aborted) throw new Error("Analysis aborted.");

//   const response = await fetch(endpoint, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": apiKey,
//     },
//     signal,
//     body: JSON.stringify({
//       contents: [{ parts: [{ text: prompt }] }],
//       generationConfig: {
//         responseMimeType: "application/json",
//         temperature: 0.2,
//       },
//     }),
//   });

//   if (!response.ok) {
//     const errorBody = await response.json().catch(() => ({}));
//     const message = errorBody?.error?.message || response.statusText;
//     throw new Error(`${MODEL_ID} (${response.status}): ${message}`);
//   }

//   const data = await response.json();
//   const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//   if (!rawText) {
//     throw new Error("Empty response received from Gemini.");
//   }

//   const parsed = JSON.parse(extractJson(rawText)) as AnalysisResult;
//   return { result: parsed, modelUsed: MODEL_ID };
// }























import type { AnalysisResult } from "../types";

const SYSTEM_PROMPT = `You are a principal software engineer, security auditor, and performance specialist. You perform rigorous code review.

Rules:
- Return ONLY valid JSON matching this schema:
{
  "language": "string",
  "plainLanguageSummary": "string",
  "performanceAnalysis": {
    "timeComplexity": "string",
    "spaceComplexity": "string",
    "bottleneck": "string"
  },
  "diagnostics": [
    {
      "startLine": number,
      "endLine": number,
      "severity": "critical" | "warning" | "info",
      "title": "string",
      "message": "string",
      "remediation": "string"
    }
  ],
  "optimizedCode": "string"
}
- Do NOT wrap in markdown fences or add explanatory text outside JSON.
- Line numbers must be 1-indexed and exact.
- optimizedCode must be the complete, runnable refactored file.`;

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

// Fallback pool in priority order: if 3.7 hits 503 load, it immediately tries 2.5/2.0
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-3.7-flash",
  "gemini-2.5-pro",
];

export async function analyzeCode(
  code: string,
  filename: string,
  language: string,
  signal?: AbortSignal
): Promise<{ result: AnalysisResult; modelUsed: string }> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY in .env.local file.");
  }

  const numberedCode = code
    .split("\n")
    .map((line, i) => `${i + 1}: ${line}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this ${language} file "${filename}":\n\n${numberedCode}`;

  let lastErrorMsg = "Unable to complete code analysis.";

  for (const model of MODEL_CANDIDATES) {
    if (signal?.aborted) throw new Error("Analysis aborted.");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const rawMsg = errorBody?.error?.message || response.statusText;
        lastErrorMsg = `[${model}] ${response.status}: ${rawMsg}`;
        // If this model is overloaded (503) or not found (404), continue to next model in pool
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastErrorMsg = `Empty response from ${model}.`;
        continue;
      }

      const parsed = JSON.parse(extractJson(rawText)) as AnalysisResult;
      return { result: parsed, modelUsed: model };
    } catch (err: any) {
      if (signal?.aborted) throw err;
      lastErrorMsg = err?.message || String(err);
    }
  }

  throw new Error(lastErrorMsg);
}