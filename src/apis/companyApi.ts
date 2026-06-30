import { apiClient } from "./authApi";
import type { CompanyDto, CompanyRelationsResponseDto } from "./apiTypes";

export interface CompanyRegistRequest {
  company_name: string;
  company_domain?: string | null;
  company_phone?: string | null;
  company_notion_workspace?: string | null;
}

export type CompanyUpdateRequest = Partial<CompanyRegistRequest>;

export async function registerCompany<TResponse = CompanyDto>(
  payload: CompanyRegistRequest,
): Promise<TResponse> {
  const response = await apiClient.post<TResponse>("/company/regist", payload);
  return response.data;
}

export async function updateCompany<TResponse = CompanyDto>(
  payload: CompanyUpdateRequest,
): Promise<TResponse> {
  const response = await apiClient.patch<TResponse>("/company/update", payload);
  return response.data;
}

export async function getCompany<TResponse = CompanyRelationsResponseDto>(): Promise<TResponse> {
  const response = await apiClient.get<TResponse>("/company");
  return response.data;
}
