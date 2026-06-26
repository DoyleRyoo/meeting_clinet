import { apiClient } from "./authApi";

type ApiRecord = Record<string, unknown>;

export interface AiSummaryResult {
  title: string;
  content: string;
  keywords: string[];
}

export interface PreprocessTranscriptRequest {
  meeting_transcript: string;
}

export interface SummaryRequest {
  meeting_cleaned_transcript: string;
}

export async function requestSpeechToText<TResponse = unknown>(
  formData: FormData,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.post("/aiactions/stt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function preprocessTranscript<TResponse = unknown>(
  payload: PreprocessTranscriptRequest,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.post("/aiactions/preprocess", payload);
  return response.data;
}

export async function createFullSummary<TResponse = unknown>(
  payload: SummaryRequest,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.post("/aiactions/summary/full", payload);
  return response.data;
}

export async function createShortSummary<TResponse = unknown>(
  payload: SummaryRequest,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.post("/aiactions/summary/short", payload);
  return response.data;
}

export async function createAiSummaryFromTranscript(
  transcript: string,
): Promise<AiSummaryResult> {
  if (!transcript.trim()) throw new Error("요약할 회의 transcript가 비어 있습니다.");

  const preprocessResponse = await preprocessTranscript({ meeting_transcript: transcript });
  const cleanedTranscript = mapPreprocessResponse(preprocessResponse) || transcript;

  const [fullSummaryResponse, shortSummaryResponse] = await Promise.all([
    createFullSummary({ meeting_cleaned_transcript: cleanedTranscript }),
    createShortSummary({ meeting_cleaned_transcript: cleanedTranscript }),
  ]);

  const shortSummary = mapShortSummaryResponse(shortSummaryResponse);
  const fullSummary = mapFullSummaryResponse(fullSummaryResponse);

  if (!shortSummary && !fullSummary) {
    throw new Error("AI 요약 결과가 비어 있습니다.");
  }

  return {
    title: shortSummary || "회의 요약",
    content: fullSummary || shortSummary,
    keywords: [],
  };
}

function mapPreprocessResponse(response: unknown): string {
  return mapTextResponse(
    response,
    "cleaned_transcript",
    "cleanedTranscript",
    "meeting_cleaned_transcript",
    "meetingCleanedTranscript",
    "transcript",
    "text",
  );
}

function mapShortSummaryResponse(response: unknown): string {
  return mapTextResponse(
    response,
    "meeting_short_summary",
    "meetingShortSummary",
    "shortSummary",
    "short_summary",
    "summary",
    "text",
  );
}

function mapFullSummaryResponse(response: unknown): string {
  if (Array.isArray(response)) {
    return response.map(mapFullSummarySection).filter(Boolean).join("\n\n");
  }

  if (!isRecord(response)) {
    return typeof response === "string" ? response : "";
  }

  const nestedResponse = response.data ?? response.fullSummary ?? response.full_summary;
  if (nestedResponse !== undefined) {
    const nestedText = mapFullSummaryResponse(nestedResponse);
    if (nestedText) return nestedText;
  }

  const objective = getString(response, "summary_objective", "summaryObjective", "objective");
  const decision = getString(response, "summary_decision", "summaryDecision", "decision");
  const summary = getString(response, "summary", "content", "text");

  return [objective, decision].filter(Boolean).join("\n\n") || summary;
}

function mapFullSummarySection(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";

  const title = getString(value, "contextTitle", "context_title", "title");
  const context = value.context;
  const lines = Array.isArray(context)
    ? context.filter((item): item is string => typeof item === "string")
    : [];

  return [title, ...lines].filter(Boolean).join("\n");
}

function mapTextResponse(response: unknown, ...keys: string[]): string {
  if (typeof response === "string") return response;
  if (!isRecord(response)) return "";

  const nestedResponse = response.data;
  if (nestedResponse !== undefined) {
    const nestedText = mapTextResponse(nestedResponse, ...keys);
    if (nestedText) return nestedText;
  }

  return getString(response, ...keys);
}

function getString(record: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
