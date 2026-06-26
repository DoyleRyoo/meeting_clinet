import { apiClient } from "./authApi";

export interface NotionAuthorizationResponse {
  authorizationUrl: string;
}

export interface NotionConnectionStatusResponse {
  notion_connected: boolean;
  notion_workspace_name?: string | null;
  notion_workspace_icon?: string | null;
  notion_workspace_url?: string | null;
}

export async function getNotionAuthorization(): Promise<NotionAuthorizationResponse> {
  const response = await apiClient.get<NotionAuthorizationResponse>(
    "/auth/notion/authorize",
  );
  return response.data;
}

export async function getNotionConnectionStatus<TResponse = NotionConnectionStatusResponse>(): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/notion/connection/status");
  return response.data;
}

export async function connectNotionWorkspace<TResponse = unknown>(): Promise<TResponse> {
  const response = await apiClient.post<TResponse>("/notion/connection");
  return response.data;
}

export async function disconnectNotionWorkspace<TResponse = unknown>(): Promise<TResponse> {
  const response = await apiClient.delete<TResponse>("/notion/connection");
  return response.data;
}
