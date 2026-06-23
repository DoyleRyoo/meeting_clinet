import { create } from "zustand";

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
          const isMockFailure = false; 
          
          if (isMockFailure) {
            reject(new Error("AI 서버 과부하로 인해 요약에 실패했습니다."));
          } else {
            resolve({
              title: "팀 프로젝트 회의록 요약본",
              content: `입력된 내용(${text.slice(0, 10)}...)에 대한 AI 요약 결과입니다.\n1. 프로젝트 프론트엔드-백엔드 연동 구조 확립.\n2. Zustand를 활용한 상태 기반 라우팅 적용.`,
              keywords: ["Zustand", "비동기", "웹프론트"],
            });
          }
        }, 3000); // 3초 대기 (가림막 페이지 노출 시간)
      });

      // 3. 성공 시 상태 업데이트
      set({
        status: "success",
        summaryData: {
          title: "팀 프로젝트 회의록 요약본",
          content: `입력된 내용에 대한 요약입니다.\nZustand 스토어 기반으로 비동기 처리가 완벽히 제어되고 있습니다.`,
          keywords: ["Zustand", "React", "State Management"],
        },
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