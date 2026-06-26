import { create } from "zustand";
import { createAiSummaryFromTranscript } from "../apis/aiActionsApi";

export type SummaryStatus = "idle" | "loading" | "success" | "error";

interface SummaryData {
  title: string;
  content: string;
  keywords: string[];
}

export interface MeetingContext {
  projectId: string | null;
  meetingId: string | null;
  projectMemberIds: string[];
}

interface SummaryState {
  status: SummaryStatus;
  summaryData: SummaryData | null;
  errorMessage: string | null;
  meetingContext: MeetingContext;
  startSummary: (text: string) => Promise<void>;
  setMeetingContext: (context: Partial<MeetingContext>) => void;
  resetMeetingContext: () => void;
  resetSummary: () => void;
}

const initialMeetingContext: MeetingContext = {
  projectId: null,
  meetingId: null,
  projectMemberIds: [],
};

export const useSummaryStore = create<SummaryState>((set) => ({
  status: "idle",
  summaryData: null,
  errorMessage: null,
  meetingContext: initialMeetingContext,

  startSummary: async (text: string) => {
    set({ status: "loading", errorMessage: null, summaryData: null });

    try {
      const summaryData = await createAiSummaryFromTranscript(text);
      set({
        status: "success",
        summaryData,
      });
    } catch (error: unknown) {
      set({
        status: "error",
        errorMessage:
          error instanceof Error
            ? error.message
            : "요약 중 알 수 없는 오류가 발생했습니다.",
      });
    }
  },

  setMeetingContext: (context) =>
    set((current) => ({
      meetingContext: {
        ...current.meetingContext,
        ...context,
        projectMemberIds: context.projectMemberIds ?? current.meetingContext.projectMemberIds,
      },
    })),

  resetMeetingContext: () => set({ meetingContext: initialMeetingContext }),

  resetSummary: () => set({ status: "idle", summaryData: null, errorMessage: null }),
}));
