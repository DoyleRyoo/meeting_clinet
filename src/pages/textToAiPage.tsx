import { useState } from "react";
import { Upload } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import { useSummaryStore } from "../store/summaryStore";

export function TextToAiPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const startSummary = useSummaryStore((state) => state.startSummary);
  const status = useSummaryStore((state) => state.status);

  const [text, setText] = useState("");

  const handleSummarize = async () => {
    if (!text.trim()) {
      alert("요약할 텍스트를 입력해주세요.");
      return;
    }

    // 1. 스토어의 비동기 작업 시작 (await를 붙이지 않고 백그라운드에서 실행되게 둡니다)
    startSummary(text);

    // 2. 즉시 가림막(로딩) 페이지로 이동
    navigate(`/projects/${pid}/record/summarizing`);
  };

  const isLoading = status === "loading";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center border-b border-border px-10 py-5">
        <h1 className="text-[18px] font-semibold">
          텍스트 AI 요약 테스트
        </h1>

        <div className="absolute right-10">
          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-foreground/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={14} />

            {isLoading ? "요약 요청 중..." : "요약하기"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 p-10">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="요약할 회의 내용을 입력해주세요..."
          className="h-full w-full resize-none rounded-xl border border-border bg-white p-6 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>
    </div>
  );
}