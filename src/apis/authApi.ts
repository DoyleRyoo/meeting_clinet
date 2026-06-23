import axios from "axios";
import type { SignupFormValues } from "../types/authTypes";

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 실제 프로그램에서 작동하는 코드입니다.
// 백엔드 OAuth2 연동 완료 후 주석을 해제하여 사용합니다.
// export function startGoogleOAuth(): void {
//   window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
// }

// 실제 프로그램에서 사용하는 코드입니다.
// 백엔드 회원정보 수정 API 연동 완료 후 주석을 해제하여 사용합니다.
// export type UpdateUserProfileRequest = {
//   name: string;
//   companyId: string;
//   userPosition: string;
//   userDepartment: string;
//   userEmployeeNumber: string;
//   profileImage?: File | null;
// };
// export async function updateUserProfile(
//   userId: string,
//   payload: UpdateUserProfileRequest,
// ): Promise<void> {
//   await authClient.put(`/users/update?uid=${userId}`, payload);
// }

type SignupResult = {
  success: boolean;
  message: string;
};

export async function login(): Promise<void> {
  await authClient.post("/auth/login");
}

export async function logout(accessToken?: string | null): Promise<void> {
  await authClient.post(
    "/auth/logout",
    undefined,
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  );
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
      ? formDataOrValues
      : createSignupFormData(formDataOrValues);
  void formData;
  void accessToken;

  // 실제 백엔드 연결 시 사용
  // const response = await authClient.post("/auth/signup", formData, {
  //   headers: { "Content-Type": "multipart/form-data" },
  // });
  // return response.data;
  
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 800);
  });

  return {
    success: true,
    message: "회원가입이 완료되었습니다.",
  };
}

function createSignupFormData(values: SignupFormValues): FormData {
  const formData = new FormData();
  formData.append("companyId", values.companyId);
  formData.append("userPosition", values.userPosition);
  formData.append("userDepartment", values.userDepartment);
  formData.append("userEmployeeNumber", values.userEmployeeNumber);
  if (values.userProfileImage) {
    formData.append("userProfileImage", values.userProfileImage);
  }
  return formData;
}
