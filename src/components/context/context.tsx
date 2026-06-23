import { createContext, useContext, useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Participant { id: string; name: string; initials: string; color: string }
export interface Meeting { id: string; title: string; date: string; nth: string }
export interface Project { id: string; name: string; meetings: Meeting[]; participants: Participant[]; notionUrl: string }
export interface Task { id: number; text: string; assignee: Participant; priority: "높음" | "중간" | "낮음"; done: boolean }

// ─── Constants ────────────────────────────────────────────────────────────────

export const PARTICIPANTS: Participant[] = [
  { id: "1", name: "유도윤", initials: "유도", color: "#F59E0B" },
  { id: "2", name: "이한선", initials: "이한", color: "#3B82F6" },
  { id: "3", name: "김인영", initials: "김인", color: "#10B981" },
  { id: "4", name: "박철현", initials: "박철", color: "#8B5CF6" },
  { id: "5", name: "최지관", initials: "최지", color: "#EF4444" },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "a",
    name: "A project",
    notionUrl: "https://notion.so/a-project",
    participants: [PARTICIPANTS[0], PARTICIPANTS[1]],
    meetings: [
      { id: "m1", title: "1차 회의", date: "2026.05.03", nth: "1차" },
      { id: "m2", title: "긴급 회의", date: "2026.05.17", nth: "긴급" },
      { id: "m3", title: "2차 회의", date: "2026.06.01", nth: "2차" },
      { id: "m4", title: "3차 회의", date: "2026.06.17", nth: "3차" },
    ],
  },
  {
    id: "b",
    name: "B project",
    notionUrl: "",
    participants: [PARTICIPANTS[2], PARTICIPANTS[3]],
    meetings: [
      { id: "m5", title: "킥오프 회의", date: "2026.06.10", nth: "킥오프" },
    ],
  },
];

export const FULL_SUMMARY = {
  핵심: [
    "AI 기반 회의록 작성 시스템에 대한 세부 요구 사항을 확정함.",
    "프론트엔드, 백엔드, AI 기능의 단계적 실행 계획을 공유함.",
  ],
  논의: [
    "회의록 생성 먼저 작업 후 실서비스 적용 예정임.",
    "Notion API 연동 및 공유 기능 개발 방향 논의.",
    "STT 및 AI 요약 기능 테스트 진행.",
    "데이터 저장 방법 관련 사항을 합의하여 우선순위를 프로젝트별로 결정.",
    "신속 승인 및 팀의 협업 솔루션 아이템으로도 활용 논의.",
  ],
  사항: [
    "에니스트 시스템을 프로젝트에 우선순위를 부여하기로 함.",
    "지역 플로우를 Notion에 자동 업로드하기로 결정함.",
    "다음 회의까지 기능 완성의 각 달성 목표 확인.",
  ],
};

export const INITIAL_TASKS: Task[] = [
  { id: 1, text: "프론트 AI 및 백엔드+프론트 UI 구현", assignee: PARTICIPANTS[0], priority: "높음", done: false },
  { id: 2, text: "Notion API 연동 및 공유 기능 구현", assignee: PARTICIPANTS[1], priority: "중간", done: false },
  { id: 3, text: "STT 및 AI 요약 기능 개발", assignee: PARTICIPANTS[2], priority: "높음", done: false },
  { id: 4, text: "Notion 자동 업로드 도입 기능 구현", assignee: PARTICIPANTS[3], priority: "낮음", done: false },
  { id: 5, text: "AI기반 데이터스토어 분석 및 활용 수행", assignee: PARTICIPANTS[4], priority: "높음", done: false },
];

export const PRIORITY_COLOR: Record<"높음" | "중간" | "낮음", string> = {
  높음: "#EF4444",
  중간: "#F59E0B",
  낮음: "#10B981",
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  summaryTab: "full" | "tasks";
  setSummaryTab: React.Dispatch<React.SetStateAction<"full" | "tasks">>;
  elapsed: number;
  setElapsed: React.Dispatch<React.SetStateAction<number>>;
  timerRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>;
}

const AppContext = createContext<AppContextValue>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const projectOwnerKey = isAuthenticated ? oauthUser?.email ?? null : null;
  const [anonymousProjects, setAnonymousProjects] = useState<Project[]>([]);
  const [, setProjectRevision] = useState(0);
  const projects = projectOwnerKey
    ? getUserProjects(projectOwnerKey)
    : anonymousProjects;
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [summaryTab, setSummaryTab] = useState<"full" | "tasks">("full");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setProjects: React.Dispatch<React.SetStateAction<Project[]>> = (value) => {
    const nextProjects =
      typeof value === "function" ? value(projects) : value;

    if (projectOwnerKey) {
      saveUserProjects(projectOwnerKey, nextProjects);
      setProjectRevision((revision) => revision + 1);
    } else {
      setAnonymousProjects(nextProjects);
    }
  };

  return (
    <AppContext.Provider value={{ projects, setProjects, tasks, setTasks, summaryTab, setSummaryTab, elapsed, setElapsed, timerRef }}>
      {children}
    </AppContext.Provider>
  );
}

// 실제 프로그램에서 사용하는 코드입니다.
// 백엔드 프로젝트 API 연동 완료 후 주석을 해제하여 사용합니다.
// const response = await apiClient.get("/projects/list");
// const response = await apiClient.post("/projects/create", projectPayload);

function getUserProjects(ownerKey: string): Project[] {
  const storageKey = `projects:${ownerKey}`;
  const storedProjects = localStorage.getItem(storageKey);
  if (!storedProjects) return createInitialProjects();

  try {
    const parsedProjects: unknown = JSON.parse(storedProjects);
    return Array.isArray(parsedProjects) ? (parsedProjects as Project[]) : [];
  } catch {
    return createInitialProjects();
  }
}

function saveUserProjects(ownerKey: string, projects: Project[]): void {
  localStorage.setItem(`projects:${ownerKey}`, JSON.stringify(projects));
}

function createInitialProjects(): Project[] {
  return INITIAL_PROJECTS.map((project) => ({
    ...project,
    meetings: project.meetings.map((meeting) => ({ ...meeting })),
    participants: project.participants.map((participant) => ({ ...participant })),
  }));
}

export const useApp = () => useContext(AppContext);
