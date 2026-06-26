import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import {
  getNotionAuthorization,
  getNotionConnectionStatus,
  type NotionConnectionStatusResponse,
} from "../apis/notionApi";

export function SignupNotionConnectPage() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState<NotionConnectionStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadConnection() {
      try {
        const response = await getNotionConnectionStatus();
        if (ignore) return;
        setConnection(response);
        setErrorMessage(null);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(error instanceof Error ? error.message : "Notion 연결 상태를 불러오지 못했습니다.");
      }
    }

    void loadConnection();
    return () => {
      ignore = true;
    };
  }, []);

  const handleConnect = async () => {
    if (isConnecting || connection?.notion_connected) return;

    setIsConnecting(true);
    try {
      const { authorizationUrl } = await getNotionAuthorization();
      window.location.href = authorizationUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      alert(`Notion 연결에 실패했습니다. ${message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSkip = () => {
    navigate("/");
  };

  const notionConnected = connection?.notion_connected ?? false;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-sm">
            {connection?.notion_workspace_icon && notionConnected ? (
              <img
                src={connection.notion_workspace_icon}
                alt=""
                className="h-6 w-6 rounded object-cover"
              />
            ) : (
              <span className="text-xl font-bold">N</span>
            )}
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-foreground">
            Notion 워크스페이스 연결
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            회의록과 할 일 목록을 Notion에 자동 업로드하려면 워크스페이스 연결이 필요합니다.
          </p>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        {notionConnected && (
          <div className="mt-6 rounded-lg border border-green-100 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  연결된 워크스페이스
                </p>
                {connection?.notion_workspace_name && (
                  <p className="mt-1 truncate text-sm text-green-700">
                    {connection.notion_workspace_name}
                  </p>
                )}
                {connection?.notion_workspace_url && (
                  <a
                    href={connection.notion_workspace_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700 underline-offset-2 hover:underline"
                  >
                    워크스페이스 보기
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-7 space-y-3">
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting || notionConnected}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConnecting && <Loader2 size={16} className="animate-spin" />}
            {isConnecting ? "연결 중..." : "Notion 연결하기"}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            나중에 연결하기
          </button>
        </div>
      </section>
    </main>
  );
}
