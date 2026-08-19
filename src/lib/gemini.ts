

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

// // Fallback pool in priority order: if 3.7 hits 503 load, it immediately tries 2.5/2.0
// const MODEL_CANDIDATES = [
//   "gemini-2.5-flash",
//   "gemini-2.0-flash",
//   "gemini-3.7-flash",
//   "gemini-2.5-pro",
// ];

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

//   let lastErrorMsg = "Unable to complete code analysis.";

//   for (const model of MODEL_CANDIDATES) {
//     if (signal?.aborted) throw new Error("Analysis aborted.");

//     const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "x-goog-api-key": apiKey,
//         },
//         signal,
//         body: JSON.stringify({
//           contents: [{ parts: [{ text: prompt }] }],
//           generationConfig: {
//             responseMimeType: "application/json",
//             temperature: 0.2,
//           },
//         }),
//       });

//       if (!response.ok) {
//         const errorBody = await response.json().catch(() => ({}));
//         const rawMsg = errorBody?.error?.message || response.statusText;
//         lastErrorMsg = `[${model}] ${response.status}: ${rawMsg}`;
//         // If this model is overloaded (503) or not found (404), continue to next model in pool
//         continue;
//       }

//       const data = await response.json();
//       const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

//       if (!rawText) {
//         lastErrorMsg = `Empty response from ${model}.`;
//         continue;
//       }

//       const parsed = JSON.parse(extractJson(rawText)) as AnalysisResult;
//       return { result: parsed, modelUsed: model };
//     } catch (err: any) {
//       if (signal?.aborted) throw err;
//       lastErrorMsg = err?.message || String(err);
//     }
//   }

//   throw new Error(lastErrorMsg);
// }
























import type { AnalysisResult } from "../types";

export class GeminiError extends Error {
  constructor(
    message: string,
    public code: "MISSING_KEY" | "INVALID_KEY" | "RATE_LIMITED" | "PARSE_ERROR" | "ABORTED" | "UNKNOWN",
    public status?: number
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

const SYSTEM_PROMPT = `You are a principal software engineer, security auditor, and performance specialist. You perform rigorous code review.

Rules:
- Return ONLY valid JSON matching the requested schema.
- Do NOT wrap in markdown fences or add explanatory text outside JSON.
- Line numbers must be 1-indexed and exact.
- optimizedCode must be the complete, runnable refactored file.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    language: { type: "STRING" },
    plainLanguageSummary: { type: "STRING" },
    performanceAnalysis: {
      type: "OBJECT",
      properties: {
        timeComplexity: { type: "STRING" },
        spaceComplexity: { type: "STRING" },
        bottleneck: { type: "STRING" },
      },
      required: ["timeComplexity", "spaceComplexity", "bottleneck"],
    },
    diagnostics: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          startLine: { type: "INTEGER" },
          endLine: { type: "INTEGER" },
          severity: { type: "STRING", enum: ["critical", "warning", "info"] },
          title: { type: "STRING" },
          message: { type: "STRING" },
          remediation: { type: "STRING" },
        },
        required: ["startLine", "endLine", "severity", "title", "message", "remediation"],
      },
    },
    optimizedCode: { type: "STRING" },
  },
  required: ["language", "plainLanguageSummary", "performanceAnalysis", "diagnostics", "optimizedCode"],
};

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

// Fallback pool in priority order: starts with 3.7 and cascades down upon 503 / 500 / 404
const MODEL_CANDIDATES = [
  "gemini-3.7-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export async function analyzeCode(
  code: string,
  filename: string,
  language: string,
  signal?: AbortSignal
): Promise<{ result: AnalysisResult; modelUsed: string }> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!apiKey) {
    throw new GeminiError(
      "Missing VITE_GEMINI_API_KEY. Please configure your environment variables.",
      "MISSING_KEY"
    );
  }

  const numberedCode = code
    .split("\n")
    .map((line, i) => `${i + 1}: ${line}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this ${language} file "${filename}":\n\n${numberedCode}`;

  let lastError: GeminiError | null = null;

  for (const model of MODEL_CANDIDATES) {
    if (signal?.aborted) {
      throw new GeminiError("Analysis was aborted.", "ABORTED");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

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
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const rawMsg = errorBody?.error?.message || response.statusText;

        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new GeminiError(
            `Invalid or unauthorized API key (${response.status}): ${rawMsg}`,
            "INVALID_KEY",
            response.status
          );
        }

        if (response.status === 429) {
          lastError = new GeminiError(
            `Rate limit or quota exceeded on ${model}. Switching to fallback models...`,
            "RATE_LIMITED",
            response.status
          );
          continue;
        }

        // Overload / server errors -> smoothly cascade to next model candidate
        lastError = new GeminiError(
          `[${model}] Server error (${response.status}): ${rawMsg}`,
          "UNKNOWN",
          response.status
        );
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = new GeminiError(
          `Model ${model} returned an empty response.`,
          "PARSE_ERROR"
        );
        continue;
      }

      try {
        const parsed = JSON.parse(extractJson(rawText)) as AnalysisResult;
        return { result: parsed, modelUsed: model };
      } catch {
        lastError = new GeminiError(
          "Failed to parse analysis results from Gemini.",
          "PARSE_ERROR"
        );
        continue;
      }
    } catch (err: any) {
      if (err instanceof GeminiError) throw err;
      if (signal?.aborted) {
        throw new GeminiError("Analysis was aborted.", "ABORTED");
      }
      lastError = new GeminiError(err?.message || String(err), "UNKNOWN");
    }
  }

  throw lastError || new GeminiError("Unable to complete code analysis across available models.", "UNKNOWN");
}