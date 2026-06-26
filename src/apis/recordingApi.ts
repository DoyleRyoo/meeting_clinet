import { requestSpeechToText } from "./aiActionsApi";

type SttResponseRecord = Record<string, unknown>;

export async function uploadRecording(formData: FormData): Promise<string> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await requestSpeechToText(formData);
  return mapSpeechToTextResponse(response);
}

export function mapSpeechToTextResponse(response: unknown): string {
  if (typeof response === "string") return response;
  if (!isRecord(response)) throw new Error("STT 응답 형식을 확인할 수 없습니다.");

  const nestedResponse = response.data;
  if (isRecord(nestedResponse) || typeof nestedResponse === "string") {
    return mapSpeechToTextResponse(nestedResponse);
  }

  const transcript = getString(
    response,
    "transcript",
    "text",
    "meeting_transcript",
    "meetingTranscript",
    "cleaned_transcript",
    "cleanedTranscript",
  );

  if (!transcript) throw new Error("STT 결과 텍스트가 비어 있습니다.");
  return transcript;
}

function getString(record: SttResponseRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
  }
  return "";
}

function isRecord(value: unknown): value is SttResponseRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
