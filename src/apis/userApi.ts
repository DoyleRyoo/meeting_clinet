import { apiClient } from "./authApi";
import type { UserDto } from "./apiTypes";

export type UserUpdateRequest = Partial<
  Pick<
    UserDto,
    | "company_id"
    | "user_email"
    | "user_name"
    | "user_profile_image"
    | "user_phone"
    | "user_department"
    | "user_role"
    | "user_status"
  >
>;

export interface UserStatusUpdateRequest {
  user_status: UserDto["user_status"];
}

export async function getUserList<TResponse = UserDto[]>(): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/users/list");
  return response.data;
}

export async function getUserDetail<TResponse = UserDto>(
  userId: string | number,
): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/users/detail", {
    params: { uid: userId },
  });
  return response.data;
}

export async function updateUser<TResponse = UserDto>(
  userId: string | number,
  payload: UserUpdateRequest,
): Promise<TResponse> {
  const response = await apiClient.put<TResponse>("/users/update", payload, {
    params: { uid: userId },
  });
  return response.data;
}

export async function updateUserStatus<TResponse = UserDto>(
  userId: string | number,
  payload: UserStatusUpdateRequest,
): Promise<TResponse> {
  const response = await apiClient.patch<TResponse>("/users/status", payload, {
    params: { uid: userId },
  });
  return response.data;
}
