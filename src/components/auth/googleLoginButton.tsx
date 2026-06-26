import { startGoogleOAuth } from "../../apis/authApi";

export function GoogleLoginButton() {
  return (
    <button
      type="button"
      onClick={startGoogleOAuth}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4285F4] text-xs font-bold text-white" aria-hidden="true">
        G
      </span>
      Google로 계속하기
    </button>
  );
}
