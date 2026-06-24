import { create } from "zustand";
import {
  createMockAiSummary,
  MOCK_AI_SUMMARY_DELAY_MS,
  MOCK_AI_SUMMARY_FAILURE,
} from "../components/context/context";

// 요약 상태 정의
export type SummaryStatus = "idle" | "loading" | "success" | "error";

interface SummaryData {
  title: string;
  content: string;
  keywords: string[];
}

interface SummaryState {
  status: SummaryStatus;
  summaryData: SummaryData | null;
  errorMessage: string | null;
  startSummary: (text: string) => Promise<void>;
  resetSummary: () => void;
}

export const useSummaryStore = create<SummaryState>((set) => ({
  status: "idle",
  summaryData: null,
  errorMessage: null,

  startSummary: async (text: string) => {
    // 1. 초기화 및 로딩 시작
    set({ status: "loading", errorMessage: null, summaryData: null });

    try {
      // 2. 백엔드 미준비 상태를 위한 Mock 비동기 통신 (3초 대기)
      // 실제 백엔드가 나오면 이 부분을 axios나 fetch API로 교체하면 됩니다.
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 테스트용 시나리오 조절: 실패 케이스를 보고 싶다면 true로 변경
          if (MOCK_AI_SUMMARY_FAILURE) {
            reject(new Error("AI 서버 과부하로 인해 요약에 실패했습니다."));
          } else {
            resolve(createMockAiSummary(text));
          }
        }, MOCK_AI_SUMMARY_DELAY_MS); // 3초 대기 (가림막 페이지 노출 시간)
      });

      // 3. 성공 시 상태 업데이트
      set({
        status: "success",
        summaryData: createMockAiSummary(text),
      });
    } catch (error: unknown) { // any 대신 unknown 사용
      // 4. 실패 시 상태 업데이트
      let message = "요약 중 알 수 없는 오류가 발생했습니다.";
      
      // error가 진짜 Error 객체인지 더블 체킹
      if (error instanceof Error) {
        message = error.message;
      }

      set({
        status: "error",
        errorMessage: message,
      });
    }
  },

  resetSummary: () => set({ status: "idle", summaryData: null, errorMessage: null }),
}));
