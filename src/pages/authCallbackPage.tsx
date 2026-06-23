// 실제 프로그램에서 작동하는 OAuth2 callback 처리 코드입니다.
// 백엔드 OAuth2 연동 완료 후 주석을 해제하여 사용합니다.
// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router";
// import { useAuthStore } from "../stores/authStore";
// import type { LoginCallbackParams, OAuthUser } from "../types/authTypes";

export function AuthCallbackPage() {
  // 실제 프로그램에서 작동하는 OAuth2 callback 처리 코드입니다.
  // 백엔드 OAuth2 연동 완료 후 주석을 해제하여 사용합니다.
  // const navigate = useNavigate();
  // const [searchParams] = useSearchParams();
  // const { setAccessToken, setOAuthUser } = useAuthStore();
  //
  // useEffect(() => {
  //   const callbackParams: LoginCallbackParams = {
  //     token: searchParams.get("token"),
  //     isNewUser: searchParams.get("isNewUser") === "true",
  //     email: searchParams.get("email"),
  //     name: searchParams.get("name"),
  //     profileImage: searchParams.get("profileImage"),
  //   };
  //
  //   if (!callbackParams.token) {
  //     navigate("/login", { replace: true });
  //     return;
  //   }
  //
  //   setAccessToken(callbackParams.token);
  //   if (callbackParams.email && callbackParams.name) {
  //     const oauthUser: OAuthUser = {
  //       email: callbackParams.email,
  //       name: callbackParams.name,
  //       profileImage: callbackParams.profileImage,
  //     };
  //     setOAuthUser(oauthUser);
  //   }
  //
  //   navigate(callbackParams.isNewUser ? "/user-info" : "/", {
  //     replace: true,
  //   });
  // }, [navigate, searchParams, setAccessToken, setOAuthUser]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        백엔드 OAuth2 연동 준비 중입니다.
      </p>
    </main>
  );
}
