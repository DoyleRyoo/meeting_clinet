export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    alert("백엔드 OAuth2 연동 준비 중입니다.");

    // 실제 프로그램에서 작동하는 코드입니다.
    // 백엔드 OAuth2 연동 완료 후 주석을 해제하여 사용합니다.
    // const oauthUrl = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
    // window.location.href = oauthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-xs font-bold text-white" aria-hidden="true">
        G
      </span>
      Google로 계속하기
    </button>
  );
}
