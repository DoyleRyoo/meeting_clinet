import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useApp } from "../components/context/useApp";
import { LoadingDots } from "../components/common/loadingDots";
import { useSummaryStore } from "../store/summaryStore";

export function SummarizingPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const { setSummaryTab } = useApp();

  // 스토어에서 status와 에러 메시지를 구독합니다.
  const status = useSummaryStore((state) => state.status);
  const errorMessage = useSummaryStore((state) => state.errorMessage);
  const meetingId = useSummaryStore((state) => state.meetingContext.meetingId);
  const resetSummary = useSummaryStore((state) => state.resetSummary);

  useEffect(() => {
    // 1. 성공 시 결과 페이지로 이동
    if (status === "success") {
      setSummaryTab("full");
      navigate(`/projects/${pid}/record/summary`, { state: meetingId ? { meetingId } : undefined });
    }

    // 2. 실패 시 토스트/얼럿 출력 후 이전 페이지로 복귀
    if (status === "error") {
      alert(errorMessage || "요약 요청에 실패했습니다."); // 프로젝트 내의 toast 함수가 있다면 대체 가능
      resetSummary(); // 상태 초기화
      navigate(-1); // 이전 페이지(TextToAiPage)로 이동
    }
  }, [status, errorMessage, navigate, pid, setSummaryTab, resetSummary, meetingId]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <LoadingDots />
      <p className="text-[22px] font-semibold text-foreground/80">요약 중...</p>
      <p className="text-sm font-light text-muted-foreground">
        회의 내용을 AI가 분석하고 있습니다.
      </p>
    </div>
  );
}
