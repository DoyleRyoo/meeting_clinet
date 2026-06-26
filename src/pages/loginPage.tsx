import { GoogleLoginButton } from "../components/auth/googleLoginButton";

export function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-sm rounded-xl border border-border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Damlok 로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">Google 계정으로 계속해 주세요.</p>
        <div className="mt-6"><GoogleLoginButton /></div>
      </section>
    </main>
  );
}
