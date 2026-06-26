import { apiClient } from "./authApi";
import type {
  ActionItem,
  ActionItemDto,
  ActionItemPriority,
  ActionItemStatus,
  FullSummaryDto,
  FullSummarySection,
  MeetingDetailResponseDto,
} from "./apiTypes";

export interface FullSummaryUpdatePayload {
  summary_objective: string;
  summary_decision: string;
}

export interface ActionItemUpdatePayload {
  meeting_id: string;
  project_member_id: string;
  assignee_name: string | null;
  assignee_email: string | null;
  action_item_task: string;
  action_item_start_date: string;
  action_item_due_date: string;
  action_item_priority: ActionItemPriority;
  action_item_status: ActionItemStatus;
}

type ApiRecord = Record<string, unknown>;

export async function getShortSummary<TResponse = unknown>(
  meetingId: string | number,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.get<TResponse>("/meetings/short", {
    params: { mid: meetingId },
  });
  return response.data;
}

export async function getFullSummary<TResponse = unknown>(
  meetingId: string | number,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.get<TResponse>("/meetings/full", {
    params: { mid: meetingId },
  });
  return response.data;
}

export async function getActionItems<TResponse = unknown>(
  meetingId: string | number,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.get<TResponse>("/meetings/action", {
    params: { mid: meetingId },
  });
  return response.data;
}

export async function updateShortSummary(
  meetingId: string | number,
  shortSummary: string,
): Promise<void> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  await apiClient.patch("/meetings/upadate/short", {
    meeting_short_summary: shortSummary,
  }, {
    params: { mid: meetingId },
  });
}

export async function updateFullSummary(
  meetingId: string | number,
  payload: FullSummaryUpdatePayload,
): Promise<void> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  await apiClient.patch("/meetings/upadate/full", payload, {
    params: { mid: meetingId },
  });
}

export async function updateActionItems(
  meetingId: string | number,
  actionItems: ActionItemUpdatePayload[],
): Promise<void> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  await apiClient.patch("/meetings/upadate/action", {
    action_items: actionItems,
  }, {
    params: { mid: meetingId },
  });
}

export function mapShortSummaryResponse(response: unknown): string {
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

export function mapFullSummaryResponse(response: unknown): FullSummarySection[] {
  const dto = mapFullSummaryDtoResponse(response);
  if (dto) {
    const sections: FullSummarySection[] = [];
    if (dto.summary_objective) sections.push({ contextTitle: "회의 목적", context: splitLines(dto.summary_objective) });
    if (dto.summary_decision) sections.push({ contextTitle: "결정 사항", context: splitLines(dto.summary_decision) });
    if (sections.length) return sections;
  }

  const source = unwrapData(response);

  if (Array.isArray(source)) {
    return source.map(mapFullSummarySection).filter((section) => section.contextTitle || section.context.length);
  }

  if (typeof source === "string") {
    return textToSections(source);
  }

  if (!isRecord(source)) return [];

  const nested = source.fullSummary ?? source.full_summary ?? source.sections;
  if (nested !== undefined) {
    const nestedSections = mapFullSummaryResponse(nested);
    if (nestedSections.length) return nestedSections;
  }

  const objective = getString(source, "summary_objective", "summaryObjective", "objective");
  const decision = getString(source, "summary_decision", "summaryDecision", "decision");
  const summary = getString(source, "summary", "content", "text");

  const sections: FullSummarySection[] = [];
  if (objective) sections.push({ contextTitle: "회의 목적", context: splitLines(objective) });
  if (decision) sections.push({ contextTitle: "결정 사항", context: splitLines(decision) });
  if (!sections.length && summary) return textToSections(summary);
  return sections;
}

export function mapActionItemsResponse(response: unknown): ActionItem[] {
  return mapActionItemsDtoResponse(response).map(mapActionItemToView).filter((item) => item.meetingId || item.task);
}


export function mapFullSummaryDtoResponse(response: unknown, meetingId?: string | number): FullSummaryDto | null {
  const source = unwrapData(response);

  if (Array.isArray(source)) {
    const sections = source.map(mapFullSummarySection).filter((section) => section.contextTitle || section.context.length);
    if (!sections.length) return null;
    return {
      summary_id: "",
      meeting_id: String(meetingId ?? ""),
      summary_objective: sections
        .filter((section) => section.contextTitle.includes("목적"))
        .flatMap((section) => section.context)
        .join("\n"),
      summary_decision: sections
        .filter((section) => section.contextTitle.includes("결정") || section.contextTitle.includes("사항"))
        .flatMap((section) => section.context)
        .join("\n"),
      summary_notion_page_id: null,
      summary_notion_page_url: null,
      summary_created_at: "",
    };
  }

  if (!isRecord(source)) {
    if (typeof source === "string") {
      return {
        summary_id: "",
        meeting_id: String(meetingId ?? ""),
        summary_objective: source,
        summary_decision: "",
        summary_notion_page_id: null,
        summary_notion_page_url: null,
        summary_created_at: "",
      };
    }
    return null;
  }

  const nested = source.fullSummary ?? source.full_summary ?? source.summary;
  if (nested !== undefined) {
    const nestedSummary = mapFullSummaryDtoResponse(nested, meetingId);
    if (nestedSummary) return nestedSummary;
  }

  const objective = getString(source, "summary_objective", "summaryObjective", "objective");
  const decision = getString(source, "summary_decision", "summaryDecision", "decision");
  const summary = getString(source, "summary", "content", "text");
  const resolvedMeetingId = getString(source, "meeting_id", "meetingId") || String(meetingId ?? "");
  const summaryId = getString(source, "summary_id", "summaryId", "id");

  if (!objective && !decision && !summary) return null;

  return {
    summary_id: summaryId,
    meeting_id: resolvedMeetingId,
    summary_objective: objective || summary,
    summary_decision: decision,
    summary_notion_page_id: getNullableString(source, "summary_notion_page_id", "summaryNotionPageId"),
    summary_notion_page_url: getNullableString(source, "summary_notion_page_url", "summaryNotionPageUrl"),
    summary_created_at: getString(source, "summary_created_at", "summaryCreatedAt", "createdAt"),
  };
}

export function mapActionItemsDtoResponse(response: unknown): ActionItemDto[] {
  const source = unwrapData(response);
  const items = Array.isArray(source)
    ? source
    : isRecord(source) && Array.isArray(source.actionItems)
      ? source.actionItems
      : isRecord(source) && Array.isArray(source.action_items)
        ? source.action_items
        : [];

  return items.map(mapActionItemDto).filter((item) => item.meeting_id || item.action_item_task);
}

export function mapMeetingDetailResponseDto(response: unknown, meetingId?: string | number): MeetingDetailResponseDto {
  const source = unwrapData(response);
  if (!isRecord(source)) {
    return {
      meeting_id: String(meetingId ?? ""),
      project_id: "",
      meeting_title: "",
      meeting_date: "",
      meeting_audio_url: null,
      duration_sec: null,
      meeting_status: "UPLOADED",
      meeting_started_at: null,
      meeting_ended_at: null,
      meeting_transcript: null,
      meeting_cleaned_transcript: null,
      meeting_short_summary: null,
      meeting_embedding: null,
      meeting_created_at: "",
      meeting_updated_at: null,
      meetingParticipants: [],
      fullSummary: null,
      actionItems: [],
    };
  }

  return {
    meeting_id: getString(source, "meeting_id", "meetingId", "id") || String(meetingId ?? ""),
    project_id: getString(source, "project_id", "projectId"),
    meeting_title: getString(source, "meeting_title", "meetingTitle", "title"),
    meeting_date: getString(source, "meeting_date", "meetingDate", "date"),
    meeting_audio_url: getNullableString(source, "meeting_audio_url", "meetingAudioUrl", "audioUrl"),
    duration_sec: getNullableNumber(source, "duration_sec", "durationSec"),
    meeting_status: getMeetingStatus(source),
    meeting_started_at: getNullableString(source, "meeting_started_at", "meetingStartedAt"),
    meeting_ended_at: getNullableString(source, "meeting_ended_at", "meetingEndedAt"),
    meeting_transcript: getNullableString(source, "meeting_transcript", "meetingTranscript", "transcript"),
    meeting_cleaned_transcript: getNullableString(source, "meeting_cleaned_transcript", "meetingCleanedTranscript", "cleanedTranscript"),
    meeting_short_summary: getNullableString(source, "meeting_short_summary", "meetingShortSummary", "shortSummary"),
    meeting_embedding: source.meeting_embedding ?? null,
    meeting_created_at: getString(source, "meeting_created_at", "meetingCreatedAt", "createdAt"),
    meeting_updated_at: getNullableString(source, "meeting_updated_at", "meetingUpdatedAt", "updatedAt"),
    meetingParticipants: getArray(source, "meetingParticipants", "meeting_participants").map(mapMeetingParticipantDto),
    fullSummary: mapFullSummaryDtoResponse(source.fullSummary ?? source.full_summary ?? source.summary, meetingId),
    actionItems: mapActionItemsDtoResponse(source.actionItems ?? source.action_items),
  };
}

export function toFullSummaryUpdatePayload(
  sections: FullSummarySection[],
): FullSummaryUpdatePayload {
  const objective = sections
    .filter((section) => section.contextTitle.includes("목적"))
    .flatMap((section) => section.context)
    .join("\n");
  const decision = sections
    .filter((section) => section.contextTitle.includes("결정") || section.contextTitle.includes("사항"))
    .flatMap((section) => section.context)
    .join("\n");
  const fallback = sections
    .map((section) => [section.contextTitle, ...section.context].filter(Boolean).join("\n"))
    .filter(Boolean)
    .join("\n\n");

  return {
    summary_objective: objective || fallback,
    summary_decision: decision,
  };
}

export function toActionItemUpdatePayload(
  meetingId: string | number,
  actionItems: ActionItem[],
): ActionItemUpdatePayload[] {
  return actionItems
    .filter((item) => Boolean(item.projectMemberId) && Boolean(item.task.trim()))
    .map((item) => ({
      meeting_id: String(meetingId),
      project_member_id: String(item.projectMemberId),
      assignee_name: item.assigneeName || null,
      assignee_email: item.assigneeEmail || null,
      action_item_task: item.task,
      action_item_start_date: item.startDate,
      action_item_due_date: item.dueDate,
      action_item_priority: item.priority,
      action_item_status: item.status,
    }));
}

function mapFullSummarySection(value: unknown): FullSummarySection {
  if (typeof value === "string") return { contextTitle: "전체 요약", context: splitLines(value) };
  if (!isRecord(value)) return { contextTitle: "", context: [] };

  const context = value.context;
  return {
    contextTitle: getString(value, "contextTitle", "context_title", "title", "summary_title"),
    context: Array.isArray(context)
      ? context.filter((item): item is string => typeof item === "string")
      : splitLines(getString(value, "content", "summary", "text")),
  };
}

function mapActionItemToView(value: ActionItemDto): ActionItem {
  return {
    actionItemId: String(value.action_item_id),
    meetingId: String(value.meeting_id),
    projectMemberId: String(value.project_member_id),
    assigneeName: value.assignee_name ?? "",
    assigneeEmail: value.assignee_email ?? "",
    task: value.action_item_task,
    startDate: value.action_item_start_date,
    dueDate: value.action_item_due_date,
    priority: value.action_item_priority,
    status: value.action_item_status,
  };
}

function mapTextResponse(response: unknown, ...keys: string[]): string {
  const source = unwrapData(response);
  if (typeof source === "string") return source;
  if (!isRecord(source)) return "";
  return getString(source, ...keys);
}

function textToSections(text: string): FullSummarySection[] {
  const lines = splitLines(text);
  return lines.length ? [{ contextTitle: "전체 요약", context: lines }] : [];
}

function splitLines(text: string): string[] {
  return text.split("\n").map((line) => line.trim()).filter(Boolean);
}

function unwrapData(response: unknown): unknown {
  if (!isRecord(response)) return response;
  return response.data ?? response;
}

function mapActionItemDto(value: unknown): ActionItemDto {
  const record = isRecord(value) ? value : {};
  return {
    action_item_id: getString(record, "action_item_id", "actionItemId", "id"),
    meeting_id: getString(record, "meeting_id", "meetingId"),
    project_member_id: getString(record, "project_member_id", "projectMemberId"),
    assignee_name: getNullableString(record, "assignee_name", "assigneeName"),
    assignee_email: getNullableString(record, "assignee_email", "assigneeEmail"),
    action_item_task: getString(record, "action_item_task", "actionItemTask", "task"),
    action_item_start_date: getString(record, "action_item_start_date", "actionItemStartDate", "startDate"),
    action_item_due_date: getString(record, "action_item_due_date", "actionItemDueDate", "dueDate"),
    action_item_priority: mapPriority(getString(record, "action_item_priority", "actionItemPriority", "priority")),
    action_item_status: mapStatus(getString(record, "action_item_status", "actionItemStatus", "status")),
    action_item_notion_page_id: getNullableString(record, "action_item_notion_page_id", "actionItemNotionPageId"),
    action_item_notion_page_url: getNullableString(record, "action_item_notion_page_url", "actionItemNotionPageUrl"),
    action_item_created_at: getString(record, "action_item_created_at", "actionItemCreatedAt", "createdAt"),
    action_item_updated_at: getNullableString(record, "action_item_updated_at", "actionItemUpdatedAt", "updatedAt"),
  };
}

function mapMeetingParticipantDto(value: unknown) {
  const record = isRecord(value) ? value : {};
  return {
    meeting_participant_id: getString(record, "meeting_participant_id", "meetingParticipantId", "id"),
    meeting_id: getString(record, "meeting_id", "meetingId"),
    project_member_id: getString(record, "project_member_id", "projectMemberId"),
    meeting_participant_created_at: getString(record, "meeting_participant_created_at", "meetingParticipantCreatedAt", "createdAt"),
  };
}

function getString(record: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

function getNullableString(record: ApiRecord, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

function getNullableNumber(record: ApiRecord, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null) return null;
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return null;
}

function getArray(record: ApiRecord, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function getMeetingStatus(record: ApiRecord): "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" {
  const value = getString(record, "meeting_status", "meetingStatus", "status");
  return value === "PROCESSING" || value === "COMPLETED" || value === "FAILED" ? value : "UPLOADED";
}

function mapPriority(value: string): ActionItem["priority"] {
  return value === "HIGH" || value === "LOW" ? value : "MEDIUM";
}

function mapStatus(value: string): ActionItem["status"] {
  return value === "진행중" || value === "완료" ? value : "미착수";
}

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
