import { apiClient } from "./authApi";
import type { ProjectParticipantDto, ProjectParticipantStatus } from "./apiTypes";

export interface RegisterParticipantRequest {
  project_id: string | number;
  user_id: string | number;
  project_member_role: string;
  project_member_grade: string;
  project_status?: ProjectParticipantStatus;
}

export interface DeleteParticipantRequest {
  project_member_id: string | number;
}

export interface UpdateParticipantStatusRequest extends DeleteParticipantRequest {
  project_status: ProjectParticipantStatus;
}

export async function registerParticipant<TResponse = ProjectParticipantDto>(
  payload: RegisterParticipantRequest,
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>("/participant/regist", payload);
  return response.data;
}

export async function getParticipantList<TResponse = ProjectParticipantDto[]>(): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/participant/list");
  return response.data;
}

export async function deleteParticipant(
  payload: DeleteParticipantRequest,
): Promise<void> {
  await apiClient.delete("/participant", { data: payload });
}

export async function updateParticipantStatus(
  payload: UpdateParticipantStatusRequest,
): Promise<void> {
  await apiClient.patch("/participant/status", payload);
}
