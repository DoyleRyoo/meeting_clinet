import { apiClient } from "./authApi";
import type {
  MeetingView,
  ParticipantView,
  ProjectDetailParticipant,
  ProjectDetailResponse,
  ProjectDetailResponseDto,
  ProjectParticipantWithUserDto,
  ProjectStatus,
  ProjectView,
  UserDto,
} from "./apiTypes";

export interface ProjectParticipantRequest {
  project_member_id?: string | number;
  user_id: string | number;
  project_member_role: string;
  project_member_grade: string;
  project_status: "ACTIVE" | "LEFT" | "REMOVED";
}

export interface CreateProjectRequest {
  company_id?: string | number;
  project_title: string;
  project_description: string | null;
  participants?: ProjectParticipantRequest[];
  notion_url?: string | null;
}

export interface UpdateProjectRequest {
  project_title: string;
  project_description: string | null;
  participants: ProjectParticipantRequest[];
}

type ApiRecord = Record<string, unknown>;

export async function createProject<TResponse = unknown>(
  payload: CreateProjectRequest,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.post("/projects/create", serializeCreateProjectPayload(payload));
  return response.data;
}

export async function getProjectList<TResponse = unknown>(): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.get("/projects/list");
  return response.data;
}

export async function getProjectDetail<TResponse = unknown>(
  projectId: string | number,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.get("/projects/detail", {
    params: { pid: projectId },
  });
  return response.data;
}

export async function updateProjectStatusApi<TResponse = unknown>(
  projectId: string | number,
  status: ProjectStatus,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.patch("/projects/status", {
    project_status: status,
  }, {
    params: { pid: projectId },
  });
  return response.data;
}

export async function updateProjectApi<TResponse = unknown>(
  projectId: string | number,
  payload: UpdateProjectRequest,
): Promise<TResponse> {
  // 실제 백엔드와 연결에 사용되는 코드입니다.
  const response = await apiClient.put("/projects/update", serializeUpdateProjectPayload(payload), {
    params: { pid: projectId },
  });
  return response.data;
}

export function mapProjectListResponse(response: unknown): ProjectView[] {
  const source = isRecord(response) && Array.isArray(response.projects)
    ? response.projects
    : response;

  if (!Array.isArray(source)) return [];
  return source.map(mapProjectResponseToProject).filter((project) => project.id);
}

export function mapProjectResponseToProject(response: unknown): ProjectView {
  const record = unwrapProjectRecord(response);
  const projectId = getString(record, "project_id", "projectId", "id");
  const title = getString(record, "project_title", "projectTitle", "title");
  const status = getProjectStatus(record, "project_status", "projectStatus", "status");
  const projectParticipants = getArray(record, "participants", "projectParticipants").map(mapProjectParticipantView);
  const meetings = getArray(record, "meetings").map(mapMeetingView);

  return {
    id: projectId,
    projectId,
    companyId: getString(record, "company_id", "companyId"),
    title,
    projectDescription: getNullableString(record, "project_description", "projectDescription", "description") ?? undefined,
    projectStatus: status,
    projectCreatedAt: getNullableString(record, "project_created_at", "projectCreatedAt", "createdAt") ?? undefined,
    projectUpdatedAt: getNullableString(record, "project_updated_at", "projectUpdatedAt", "updatedAt") ?? undefined,
    meetings,
    participants: projectParticipants,
    projectParticipants: projectParticipants.map((participant) => ({
      ...participant,
      projectMemberId: participant.projectMemberId ?? "",
      projectId,
      userId: participant.id,
      projectMemberRole: participant.projectMemberRole ?? "MEMBER",
      projectMemberCreatedAt: "",
      projectMemberUpdatedAt: "",
      projectMemberStatus: participant.projectMemberStatus ?? "ACTIVE",
      projectMemberGrade: participant.projectMemberGrade ?? "MEMBER",
    })),
    notionUrl: getNullableString(record, "notion_url", "notionUrl") ?? "",
  };
}

export function mapProjectDetailResponse(response: unknown): ProjectDetailResponse {
  const dto = mapProjectDetailResponseDto(response);
  const participants = (dto.participants ?? []).map(mapProjectDetailParticipantToView);
  const meetings = (dto.meetings ?? []).map(mapMeetingView);

  return {
    projectId: String(dto.project_id),
    companyId: String(dto.company_id),
    title: dto.project_title,
    description: dto.project_description ?? "",
    status: dto.project_status,
    createdAt: dto.project_created_at,
    updatedAt: dto.project_updated_at,
    participants,
    projectParticipants: participants.map((participant) => ({
      ...participant,
      projectMemberId: participant.projectMemberId ?? "",
      projectId: participant.projectId,
      userId: participant.userId,
      projectMemberRole: participant.projectMemberRole ?? "MEMBER",
      projectMemberCreatedAt: participant.projectMemberCreatedAt,
      projectMemberUpdatedAt: participant.projectMemberUpdatedAt,
      projectMemberStatus: participant.projectMemberStatus ?? "ACTIVE",
      projectMemberGrade: participant.projectMemberGrade ?? "MEMBER",
    })),
    meetings,
  };
}

function unwrapProjectRecord(response: unknown): ApiRecord {
  if (!isRecord(response)) return {};
  const nested = response.project ?? response.data;
  return isRecord(nested) ? nested : response;
}

function serializeCreateProjectPayload(payload: CreateProjectRequest): ApiRecord {
  const { notion_url: _notionUrl, participants, ...rest } = payload;
  return {
    ...rest,
    participants: normalizeProjectParticipantRequests(participants ?? [], false),
  };
}

function serializeUpdateProjectPayload(payload: UpdateProjectRequest): ApiRecord {
  const { participants, ...rest } = payload;
  return {
    ...rest,
    participants: normalizeProjectParticipantRequests(participants, true),
  };
}

function normalizeProjectParticipantRequests(
  participants: ProjectParticipantRequest[],
  includeParticipantId: boolean,
): ApiRecord[] {
  return participants.map((participant) => {
    const normalized: ApiRecord = {
      user_id: participant.user_id,
      project_member_role: participant.project_member_role,
      project_member_grade: participant.project_member_grade,
      project_status: participant.project_status,
    };

    if (includeParticipantId && participant.project_member_id !== undefined) {
      normalized.project_member_id = participant.project_member_id;
    }

    return normalized;
  });
}

function mapProjectDetailResponseDto(response: unknown): ProjectDetailResponseDto {
  const record = unwrapProjectRecord(response);
  const participants = getArray(record, "participants", "projectParticipants").map(mapProjectParticipantDto);
  const meetings = getArray(record, "meetings").map(mapMeetingDto);

  return {
    project_id: getString(record, "project_id", "projectId", "id"),
    company_id: getString(record, "company_id", "companyId"),
    project_title: getString(record, "project_title", "projectTitle", "title"),
    project_description: getNullableString(record, "project_description", "projectDescription", "description"),
    project_status: getProjectStatus(record, "project_status", "projectStatus", "status"),
    project_created_at: getString(record, "project_created_at", "projectCreatedAt", "createdAt"),
    project_updated_at: getNullableString(record, "project_updated_at", "projectUpdatedAt", "updatedAt"),
    participants,
    meetings,
  };
}

function mapProjectParticipantDto(value: unknown): ProjectParticipantWithUserDto {
  const record = isRecord(value) ? value : {};
  const userRecord = isRecord(record.user) ? record.user : record;

  return {
    project_member_id: getString(record, "project_member_id", "projectMemberId", "id"),
    project_id: getString(record, "project_id", "projectId"),
    user_id: getString(record, "user_id", "userId", "id"),
    project_member_role: getString(record, "project_member_role", "projectMemberRole", "role") || "MEMBER",
    project_member_created_at: getString(record, "project_member_created_at", "projectMemberCreatedAt", "createdAt"),
    project_member_updated_at: getNullableString(record, "project_member_updated_at", "projectMemberUpdatedAt", "updatedAt"),
    project_status: getParticipantStatus(record, "project_status", "projectMemberStatus", "status"),
    project_member_grade: getString(record, "project_member_grade", "projectMemberGrade", "grade") || "MEMBER",
    user: mapUserDto(userRecord),
  };
}

function mapProjectParticipantView(value: unknown): ParticipantView {
  const dto = mapProjectParticipantDto(value);
  return {
    id: String(dto.user_id),
    title: dto.user.user_name || String(dto.user_id),
    initials: (dto.user.user_name || String(dto.user_id)).slice(0, 2),
    color: getString(isRecord(value) ? value : {}, "color") || "#6B7280",
    email: dto.user.user_email,
    profileImage: dto.user.user_profile_image,
    projectMemberId: String(dto.project_member_id),
    projectMemberRole: dto.project_member_role,
    projectMemberStatus: dto.project_status,
    projectMemberGrade: dto.project_member_grade,
  };
}

function mapProjectDetailParticipantToView(value: ProjectParticipantWithUserDto): ProjectDetailParticipant {
  const participantView = mapProjectParticipantView(value);
  return {
    ...participantView,
    projectMemberId: String(value.project_member_id),
    projectId: String(value.project_id),
    userId: String(value.user_id),
    projectMemberRole: value.project_member_role,
    projectMemberCreatedAt: value.project_member_created_at,
    projectMemberUpdatedAt: value.project_member_updated_at ?? "",
    projectMemberStatus: value.project_status,
    projectMemberGrade: value.project_member_grade,
    user: {
      userId: String(value.user.user_id),
      name: value.user.user_name,
      email: value.user.user_email,
      department: value.user.user_department,
      grade: value.project_member_grade,
      position: value.user.user_role,
      profileImage: value.user.user_profile_image,
      status: value.user.user_status ? "ACTIVE" : "INACTIVE",
    },
  };
}

function mapMeetingDto(value: unknown) {
  const record = isRecord(value) ? value : {};
  return {
    meeting_id: getString(record, "meeting_id", "meetingId", "id"),
    project_id: getString(record, "project_id", "projectId"),
    meeting_title: getString(record, "meeting_title", "meetingTitle", "title"),
    meeting_date: getString(record, "meeting_date", "meetingDate", "date"),
    meeting_audio_url: getNullableString(record, "meeting_audio_url", "meetingAudioUrl", "audioUrl"),
    duration_sec: getNullableNumber(record, "duration_sec", "durationSec"),
    meeting_status: getMeetingStatus(record),
    meeting_started_at: getNullableString(record, "meeting_started_at", "meetingStartedAt"),
    meeting_ended_at: getNullableString(record, "meeting_ended_at", "meetingEndedAt"),
    meeting_transcript: getNullableString(record, "meeting_transcript", "meetingTranscript", "transcript"),
    meeting_cleaned_transcript: getNullableString(record, "meeting_cleaned_transcript", "meetingCleanedTranscript", "cleanedTranscript"),
    meeting_short_summary: getNullableString(record, "meeting_short_summary", "meetingShortSummary", "shortSummary"),
    meeting_embedding: record.meeting_embedding ?? null,
    meeting_created_at: getString(record, "meeting_created_at", "meetingCreatedAt", "createdAt"),
    meeting_updated_at: getNullableString(record, "meeting_updated_at", "meetingUpdatedAt", "updatedAt"),
  };
}

function mapMeetingView(value: unknown): MeetingView {
  const record = isRecord(value) ? value : {};
  return {
    id: getString(record, "meeting_id", "meetingId", "id"),
    title: getString(record, "meeting_title", "meetingTitle", "title"),
    date: getString(record, "meeting_date", "meetingDate", "date"),
    nth: getString(record, "nth") || getString(record, "meeting_title", "meetingTitle", "title"),
  };
}

function mapUserDto(record: ApiRecord): UserDto {
  return {
    user_id: getString(record, "user_id", "userId", "id"),
    company_id: getString(record, "company_id", "companyId"),
    user_email: getString(record, "user_email", "userEmail", "email"),
    user_name: getString(record, "user_name", "userName", "name", "title") || getString(record, "user_id", "userId", "id"),
    user_profile_image: getNullableString(record, "user_profile_image", "userProfileImage", "profileImage"),
    user_last_login: getNullableString(record, "user_last_login", "userLastLogin", "lastLogin"),
    user_phone: getNullableString(record, "user_phone", "userPhone"),
    user_department: getString(record, "user_department", "userDepartment", "department"),
    user_role: getString(record, "user_role", "userRole", "position"),
    user_status: getBoolean(record, "user_status", "userStatus", "status"),
    user_created_at: getString(record, "user_created_at", "userCreatedAt", "createdAt"),
    user_updated_at: getNullableString(record, "user_updated_at", "userUpdatedAt", "updatedAt"),
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

function getBoolean(record: ApiRecord, ...keys: string[]): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "active") return true;
      if (normalized === "false" || normalized === "0" || normalized === "inactive") return false;
    }
  }
  return false;
}

function getArray(record: ApiRecord, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function getProjectStatus(record: ApiRecord, ...keys: string[]): ProjectStatus {
  const value = getString(record, ...keys);
  return value === "COMPLETED" || value === "ARCHIVED" ? value : "ACTIVE";
}

function getParticipantStatus(record: ApiRecord, ...keys: string[]) {
  const value = getString(record, ...keys);
  return value === "LEFT" || value === "REMOVED" ? value : "ACTIVE";
}

function getMeetingStatus(record: ApiRecord): "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" {
  const value = getString(record, "meeting_status", "meetingStatus", "status");
  return value === "PROCESSING" || value === "COMPLETED" || value === "FAILED" ? value : "UPLOADED";
}

function isRecord(value: unknown): value is ApiRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
