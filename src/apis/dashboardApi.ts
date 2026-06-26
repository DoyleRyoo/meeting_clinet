import { apiClient } from "./authApi";
import type { ActionItemDto, MeetingDto } from "./apiTypes";

export async function getDashboardMeetings<TResponse = MeetingDto[]>(
  userId: string | number,
): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/dashboard/meetings", {
    params: { uid: userId },
  });
  return response.data;
}

export async function getDashboardActions<TResponse = ActionItemDto[]>(
  userId: string | number,
): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/dashboard/actions", {
    params: { uid: userId },
  });
  return response.data;
}
