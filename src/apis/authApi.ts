import axios from "axios";
import type { SignupFormValues } from "../types/authTypes";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export function startGoogleOAuth(): void {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
}

export interface SignupResult {
  success: boolean;
  message: string;
}

export async function login<TResponse = unknown>(): Promise<TResponse> {
  const response = await apiClient.post<TResponse>("/auth/login");
  return response.data;
}

export async function logout<TResponse = unknown>(
  accessToken?: string | null,
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>(
    "/auth/logout",
    undefined,
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  );
  return response.data;
}

export function signup(formData: FormData): Promise<SignupResult>;
export function signup(
  values: SignupFormValues,
  accessToken: string,
): Promise<SignupResult>;
export async function signup(
  formDataOrValues: FormData | SignupFormValues,
  accessToken?: string,
): Promise<SignupResult> {
  const formData =
    formDataOrValues instanceof FormData
      ? normalizeSignupFormData(formDataOrValues)
      : createSignupFormData(formDataOrValues);

  const response = await apiClient.post<SignupResult>("/auth/signup", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
  return response.data;
}

function createSignupFormData(values: SignupFormValues): FormData {
  const formData = new FormData();
  formData.append("company_id", values.companyId);
  formData.append("user_role", values.userPosition);
  formData.append("user_department", values.userDepartment);
  formData.append("user_employee_number", values.userEmployeeNumber);
  if (values.userProfileImage) {
    formData.append("user_profile_image", values.userProfileImage);
  }
  return formData;
}

function normalizeSignupFormData(source: FormData): FormData {
  const formData = new FormData();
  appendIfPresent(formData, "user_email", source.get("user_email") ?? source.get("email"));
  appendIfPresent(formData, "user_name", source.get("user_name") ?? source.get("name"));
  appendIfPresent(formData, "company_id", source.get("company_id") ?? source.get("companyId"));
  appendIfPresent(formData, "user_role", source.get("user_role") ?? source.get("userPosition"));
  appendIfPresent(formData, "user_department", source.get("user_department") ?? source.get("userDepartment"));
  appendIfPresent(formData, "user_employee_number", source.get("user_employee_number") ?? source.get("userEmployeeNumber"));
  appendIfPresent(
    formData,
    "user_profile_image",
    source.get("user_profile_image") ?? source.get("userProfileImage"),
  );
  return formData;
}

function appendIfPresent(formData: FormData, key: string, value: FormDataEntryValue | null): void {
  if (value !== null) formData.append(key, value);
}
