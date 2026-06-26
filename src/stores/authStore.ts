import { create } from "zustand";
import type { AuthStatus, OAuthUser } from "../types/authTypes";

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  oauthUser: OAuthUser | null;
  isSignupModalOpen: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setOAuthUser: (oauthUser: OAuthUser | null) => void;
  openSignupModal: () => void;
  closeSignupModal: () => void;
  logout: () => void;
};

const accessTokenStorageKey = "accessToken";
const oauthUserStorageKey = "oauthUser";
const savedAccessToken = localStorage.getItem(accessTokenStorageKey);
const savedOAuthUser = getSavedOAuthUser();

export const useAuthStore = create<AuthState>((set) => ({
  status: savedAccessToken ? "authenticated" : "unauthenticated",
  accessToken: savedAccessToken,
  oauthUser: savedOAuthUser,
  isSignupModalOpen: false,
  setAccessToken: (accessToken) => {
    if (accessToken) localStorage.setItem(accessTokenStorageKey, accessToken);
    else localStorage.removeItem(accessTokenStorageKey);
    set({
      accessToken,
      status: accessToken ? "authenticated" : "unauthenticated",
    });
  },
  setOAuthUser: (oauthUser) => {
    if (oauthUser) {
      localStorage.setItem(oauthUserStorageKey, JSON.stringify(oauthUser));
    } else {
      localStorage.removeItem(oauthUserStorageKey);
    }
    set({ oauthUser });
  },
  openSignupModal: () => set({ isSignupModalOpen: true }),
  closeSignupModal: () => set({ isSignupModalOpen: false }),
  logout: () => {
    localStorage.removeItem(accessTokenStorageKey);
    localStorage.removeItem(oauthUserStorageKey);
    set({
      status: "unauthenticated",
      accessToken: null,
      oauthUser: null,
      isSignupModalOpen: false,
    });
  },
}));

function getSavedOAuthUser(): OAuthUser | null {
  const storedOAuthUser = localStorage.getItem(oauthUserStorageKey);
  if (!storedOAuthUser) return null;

  try {
    const parsedOAuthUser: unknown = JSON.parse(storedOAuthUser);
    return isOAuthUser(parsedOAuthUser) ? parsedOAuthUser : null;
  } catch {
    localStorage.removeItem(oauthUserStorageKey);
    return null;
  }
}

function isOAuthUser(value: unknown): value is OAuthUser {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    (candidate.profileImage === undefined ||
      candidate.profileImage === null ||
      typeof candidate.profileImage === "string") &&
    (candidate.companyId === undefined || typeof candidate.companyId === "string") &&
    (candidate.userPosition === undefined ||
      typeof candidate.userPosition === "string") &&
    (candidate.userDepartment === undefined ||
      typeof candidate.userDepartment === "string") &&
    (candidate.userEmployeeNumber === undefined ||
      typeof candidate.userEmployeeNumber === "string")
  );
}
