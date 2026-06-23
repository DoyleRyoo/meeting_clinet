export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

export type OAuthUser = {
  email: string;
  name: string;
  profileImage?: string | null;
  companyId?: string;
  userPosition?: string;
  userDepartment?: string;
  userEmployeeNumber?: string;
};

export type LoginCallbackParams = {
  token: string | null;
  isNewUser: boolean;
  email: string | null;
  name: string | null;
  profileImage: string | null;
};

export type SignupFormValues = {
  companyId: string;
  userPosition: string;
  userDepartment: string;
  userEmployeeNumber: string;
  userProfileImage?: File | null;
};
