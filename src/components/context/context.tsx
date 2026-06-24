import { createContext, useContext, useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import type { OAuthUser, SignupFormValues } from "../../types/authTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export const projectParticipantStatus = {
  active: "ACTIVE",
  left: "LEFT",
  removed: "REMOVED",
} as const;
export type ProjectParticipantStatus =
  (typeof projectParticipantStatus)[keyof typeof projectParticipantStatus];
export const projectParticipantStatusLabel: Record<
  ProjectParticipantStatus,
  string
> = {
  ACTIVE: "참가중",
  LEFT: "프로젝트 미참가",
  REMOVED: "퇴사",
};

export interface Participant {
  id: string;
  title: string;
  initials: string;
  color: string;
  email?: string;
  profileImage?: string | null;
  projectMemberId?: string;
  projectMemberRole?: string;
  projectMemberStatus?: ProjectParticipantStatus;
  projectMemberGrade?: string;
}
export interface Company {
  companyId: string;
  companyName: string;
  companyDomain: string | null;
  companyPhone: string | null;
  companyCreatedAt: string;
  companyUpdatedAt: string | null;
  companyNotionWorkspace: string | null;
}
export interface User {
  userId: string;
  companyId: string;
  userEmail: string;
  userName: string;
  userProfileImage: string | null;
  userLastLogin: string | null;
  userPhone: string | null;
  userDepartment: string;
  userRole: string;
  userStatus: boolean;
  userCreatedAt: string;
  userUpdatedAt: string | null;
}
export interface ProjectParticipant extends Participant {
  projectMemberId: string;
  projectId: string;
  userId: string;
  projectMemberRole: string;
  projectMemberCreatedAt: string;
  projectMemberUpdatedAt: string;
  projectMemberStatus: ProjectParticipantStatus;
  projectMemberGrade: string;
}
export interface ProjectParticipantUser {
  userId: string;
  name: string;
  email: string;
  department: string;
  grade: string;
  position: string;
  profileImage: string | null;
  status: string;
}
export interface ProjectDetailParticipant extends ProjectParticipant {
  user: ProjectParticipantUser;
}
export interface ProjectDetailResponse {
  projectId: string;
  companyId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  participants: ProjectDetailParticipant[];
}
export interface UpdateProjectParticipant {
  projectMemberId?: string;
  userId: string;
  role: string;
  grade: string;
  status: ProjectParticipantStatus;
}
export interface UpdateProjectRequest {
  title: string;
  description: string;
  participants: UpdateProjectParticipant[];
}
export interface UpdateProjectResponse extends ProjectDetailResponse {}
export interface UpdateProjectResult {
  project: Project;
  response: UpdateProjectResponse;
}
export interface Meeting { id: string; title: string; date: string; nth: string }
export interface Project {
  id: string;
  projectId?: string;
  companyId?: string;
  title: string;
  projectDescription?: string;
  projectStatus?: string;
  projectCreatedAt?: string;
  projectUpdatedAt?: string;
  meetings: Meeting[];
  participants: Participant[];
  projectParticipants?: ProjectParticipant[];
  notionUrl: string;
}
export interface Task { id: number; text: string; assignee: Participant; priority: "높음" | "중간" | "낮음"; done: boolean }

// ─── Mock data ────────────────────────────────────────────────────────────────

// 테스트 코드입니다 추후 삭제되어야합니다
// ===== 삭제 시작: ERD 기반 Mock 데이터 =====
export const MOCK_COMPANIES: Company[] = [
  { companyId: "company-1", companyName: "Damlok", companyDomain: "damlok.example.com", companyPhone: null, companyCreatedAt: "2026-05-01T09:00:00.000Z", companyUpdatedAt: null, companyNotionWorkspace: null },
];

export const MOCK_USERS: User[] = [
  { userId: "1", companyId: "company-1", userEmail: "doyoon@example.com", userName: "유도윤", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "제품개발팀", userRole: "프론트엔드 개발자", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "2", companyId: "company-1", userEmail: "hanseon@example.com", userName: "이한선", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "제품개발팀", userRole: "백엔드 개발자", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "3", companyId: "company-1", userEmail: "inyoung@example.com", userName: "김인영", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "AI연구팀", userRole: "AI 엔지니어", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "4", companyId: "company-1", userEmail: "cheolhyeon@example.com", userName: "박철현", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "기획팀", userRole: "프로덕트 매니저", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "5", companyId: "company-1", userEmail: "jigwan@example.com", userName: "최지관", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "디자인팀", userRole: "프로덕트 디자이너", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "6", companyId: "company-1", userEmail: "haneul@example.com", userName: "서하늘", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "제품개발팀", userRole: "프론트엔드 개발자", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "7", companyId: "company-1", userEmail: "minjun@example.com", userName: "정민준", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "AI연구팀", userRole: "ML 엔지니어", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
  { userId: "8", companyId: "company-1", userEmail: "seoyeon@example.com", userName: "윤서연", userProfileImage: null, userLastLogin: null, userPhone: null, userDepartment: "디자인팀", userRole: "UX 디자이너", userStatus: true, userCreatedAt: "2026-05-01T09:00:00.000Z", userUpdatedAt: null },
];

const participantColors = ["#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];
export const PARTICIPANTS: Participant[] = MOCK_USERS.map((user, index) => ({
  id: user.userId,
  title: user.userName,
  initials: user.userName.slice(0, 2),
  color: participantColors[index % participantColors.length],
  email: user.userEmail,
  profileImage: user.userProfileImage,
}));

export const MOCK_OAUTH_USER: OAuthUser = {
  email: MOCK_USERS[0].userEmail,
  name: MOCK_USERS[0].userName,
  profileImage: MOCK_USERS[0].userProfileImage,
  companyId: MOCK_USERS[0].companyId,
  userPosition: MOCK_USERS[0].userRole,
  userDepartment: MOCK_USERS[0].userDepartment,
  userEmployeeNumber: "1001",
};

export const INITIAL_SIGNUP_FORM_VALUES: SignupFormValues = {
  companyId: "",
  userPosition: "",
  userDepartment: "",
  userEmployeeNumber: "",
  userProfileImage: null,
};

export const MOCK_AI_SUMMARY = {
  title: "팀 프로젝트 회의록 요약본",
  content:
    "입력된 내용에 대한 요약입니다.\nZustand 스토어 기반으로 비동기 처리가 완벽히 제어되고 있습니다.",
  keywords: ["Zustand", "React", "State Management"],
};
export const MOCK_AI_SUMMARY_DELAY_MS = 3000;
export const MOCK_AI_SUMMARY_FAILURE = false;

export function createMockAiSummary(inputText: string) {
  return {
    ...MOCK_AI_SUMMARY,
    content: `입력된 내용(${inputText.slice(0, 10)}...)에 대한 AI 요약 결과입니다.\n1. 프로젝트 프론트엔드-백엔드 연동 구조 확립.\n2. Zustand를 활용한 상태 기반 라우팅 적용.`,
  };
}

export function createMockMeetingTranscript(elapsedSeconds: number): string {
  return `총 ${elapsedSeconds}초 동안 녹음된 회의 오디오 데이터 원본`;
}
// ===== 삭제 끝: ERD 기반 Mock 데이터 =====

// 테스트 코드입니다 추후 삭제되어야합니다
// ===== 삭제 시작: 프로젝트 참가자 상태 Mock 데이터 =====
export const INITIAL_PROJECTS: Project[] = [
  {
    id: "a",
    projectId: "a",
    companyId: "company-1",
    title: "A project",
    projectDescription: "AI 기반 회의록 작성 시스템 프로젝트",
    projectStatus: "ACTIVE",
    projectCreatedAt: "2026-05-01T09:00:00.000Z",
    projectUpdatedAt: "2026-06-17T09:00:00.000Z",
    notionUrl: "https://notion.so/a-project",
    participants: [PARTICIPANTS[0], PARTICIPANTS[1]],
    projectParticipants: [
      {
        ...PARTICIPANTS[0],
        projectMemberId: "pm-a-1",
        projectId: "a",
        userId: "1",
        projectMemberRole: "OWNER",
        projectMemberCreatedAt: "2026-05-01T09:00:00.000Z",
        projectMemberUpdatedAt: "2026-05-01T09:00:00.000Z",
        projectMemberStatus: projectParticipantStatus.active,
        projectMemberGrade: "MEMBER",
      },
      {
        ...PARTICIPANTS[1],
        projectMemberId: "pm-a-2",
        projectId: "a",
        userId: "2",
        projectMemberRole: "MEMBER",
        projectMemberCreatedAt: "2026-05-01T09:00:00.000Z",
        projectMemberUpdatedAt: "2026-05-01T09:00:00.000Z",
        projectMemberStatus: projectParticipantStatus.left,
        projectMemberGrade: "MEMBER",
      },
    ],
    meetings: [
      { id: "m1", title: "1차 회의", date: "2026.05.03", nth: "1차" },
      { id: "m2", title: "긴급 회의", date: "2026.05.17", nth: "긴급" },
      { id: "m3", title: "2차 회의", date: "2026.06.01", nth: "2차" },
      { id: "m4", title: "3차 회의", date: "2026.06.17", nth: "3차" },
    ],
  },
  {
    id: "b",
    projectId: "b",
    companyId: "company-1",
    title: "B project",
    projectDescription: "회의록 자동화 기능 검증 프로젝트",
    projectStatus: "ACTIVE",
    projectCreatedAt: "2026-06-01T09:00:00.000Z",
    projectUpdatedAt: "2026-06-10T09:00:00.000Z",
    notionUrl: "",
    participants: [PARTICIPANTS[2], PARTICIPANTS[3]],
    projectParticipants: [
      {
        ...PARTICIPANTS[2],
        projectMemberId: "pm-b-1",
        projectId: "b",
        userId: "3",
        projectMemberRole: "OWNER",
        projectMemberCreatedAt: "2026-06-01T09:00:00.000Z",
        projectMemberUpdatedAt: "2026-06-01T09:00:00.000Z",
        projectMemberStatus: projectParticipantStatus.active,
        projectMemberGrade: "MEMBER",
      },
      {
        ...PARTICIPANTS[3],
        projectMemberId: "pm-b-2",
        projectId: "b",
        userId: "4",
        projectMemberRole: "MEMBER",
        projectMemberCreatedAt: "2026-06-01T09:00:00.000Z",
        projectMemberUpdatedAt: "2026-06-01T09:00:00.000Z",
        projectMemberStatus: projectParticipantStatus.removed,
        projectMemberGrade: "MEMBER",
      },
    ],
    meetings: [
      { id: "m5", title: "킥오프 회의", date: "2026.06.10", nth: "킥오프" },
    ],
  },
];
// ===== 삭제 끝: 프로젝트 참가자 상태 Mock 데이터 =====

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

// 실제 백엔드 연결에서 필요한 코드입니다.
// 백엔드 프로젝트 목록 조회 API 연동 완료 후 주석을 해제하여 사용합니다.
// export const getProjectList = async () => {
//   const response = await axios.get("/projects/list");
//   return response.data;
// };

// 테스트 코드입니다 추후 삭제되어야합니다
// ===== 삭제 시작: 프로젝트 상세 조회 Mock 데이터 =====
export function getProjectDetail(
  projectId: string | number,
  projects: Project[],
): ProjectDetailResponse | undefined {
  // 실제 백엔드와 연결에 사용되는 코드입니다
  // 백엔드 프로젝트 상세 조회 API 연동 완료 후 주석을 해제하여 사용합니다.
  // const response = await axios.get(`/projects/detail?pid=${projectId}`);

  const selectedProjectId = String(projectId);
  const project = projects.find(
    (currentProject) =>
      currentProject.id === selectedProjectId ||
      currentProject.projectId === selectedProjectId,
  );

  if (!project) return undefined;

  const participants: ProjectParticipant[] =
    project.projectParticipants ??
    project.participants.map((participant, index) => ({
      ...participant,
      projectMemberId: `mock-project-member-${selectedProjectId}-${participant.id}`,
      projectId: selectedProjectId,
      userId: participant.id,
      projectMemberRole: index === 0 ? "OWNER" : "MEMBER",
      projectMemberCreatedAt: project.projectCreatedAt ?? "",
      projectMemberUpdatedAt: project.projectUpdatedAt ?? "",
      projectMemberStatus: projectParticipantStatus.active,
      projectMemberGrade: "MEMBER",
    }));

  return {
    projectId: project.projectId ?? project.id,
    companyId: project.companyId ?? "mock-company",
    title: project.title,
    description: project.projectDescription ?? "",
    status: project.projectStatus ?? "ACTIVE",
    createdAt: project.projectCreatedAt ?? "",
    updatedAt: project.projectUpdatedAt ?? null,
    participants: participants.map((participant) => {
      const user = MOCK_USERS.find(
        (mockUser) => mockUser.userId === participant.userId,
      );

      return {
        ...participant,
        user: user
          ? {
              userId: user.userId,
              name: user.userName,
              email: user.userEmail,
              department: user.userDepartment,
              grade: participant.projectMemberGrade,
              position: user.userRole,
              profileImage: user.userProfileImage,
              status: user.userStatus ? "ACTIVE" : "INACTIVE",
            }
          : {
              userId: participant.userId,
              name: participant.title,
              email: participant.email ?? `${participant.userId}@example.com`,
              department: "미지정",
              grade: participant.projectMemberGrade,
              position: "미지정",
              profileImage: participant.profileImage ?? null,
              status: participant.projectMemberStatus,
            },
      };
    }),
  };
}
// ===== 삭제 끝: 프로젝트 상세 조회 Mock 데이터 =====

// 테스트 코드입니다 추후 삭제되어야합니다
// ===== 삭제 시작: 프로젝트 전체 수정 Mock 코드 =====
export function updateProject(
  projectId: string | number,
  payload: UpdateProjectRequest,
  projects: Project[],
): UpdateProjectResult | undefined {
  // 실제 백엔드와 연결에 사용되는 코드입니다
  // 백엔드 프로젝트 전체 수정 API 연동 완료 후 주석을 해제하여 사용합니다.
  // const response = await axios.put(`/projects/update?pid=${projectId}`, payload);
  // return response.data;

  const selectedProjectId = String(projectId);
  const project = projects.find(
    (currentProject) =>
      currentProject.id === selectedProjectId ||
      currentProject.projectId === selectedProjectId,
  );
  if (!project) return undefined;

  const timestamp = new Date().toISOString();
  const existingParticipants = new Map(
    (project.projectParticipants ?? []).map((participant) => [
      participant.userId,
      participant,
    ]),
  );
  const availableParticipants = new Map(
    [...project.participants, ...PARTICIPANTS].map((participant) => [
      participant.id,
      participant,
    ]),
  );
  const updatedParticipants = payload.participants.map((participant) => {
    const existingParticipant = existingParticipants.get(participant.userId);
    const displayParticipant = availableParticipants.get(participant.userId) ?? {
      id: participant.userId,
      title: participant.userId,
      initials: participant.userId.slice(0, 2),
      color: "#6B7280",
    };

    return {
      ...displayParticipant,
      projectMemberId:
        participant.projectMemberId ??
        existingParticipant?.projectMemberId ??
        `mock-project-member-${selectedProjectId}-${participant.userId}`,
      projectId: project.projectId ?? project.id,
      userId: participant.userId,
      projectMemberRole: participant.role,
      projectMemberCreatedAt:
        existingParticipant?.projectMemberCreatedAt ?? timestamp,
      projectMemberUpdatedAt: timestamp,
      projectMemberStatus: participant.status,
      projectMemberGrade: participant.grade,
    };
  });
  const updatedProject: Project = {
    ...project,
    title: payload.title,
    projectDescription: payload.description,
    projectUpdatedAt: timestamp,
    participants: updatedParticipants.map(({ projectMemberId: _, ...participant }) => participant),
    projectParticipants: updatedParticipants,
  };
  const response = getProjectDetail(project.projectId ?? project.id, [
    ...projects.filter((currentProject) => currentProject.id !== project.id),
    updatedProject,
  ]);

  if (!response) return undefined;
  return { project: updatedProject, response };
}
// ===== 삭제 끝: 프로젝트 전체 수정 Mock 코드 =====

function getUserProjects(ownerKey: string): Project[] {
  const storageKey = `projects:${ownerKey}`;
  const storedProjects = localStorage.getItem(storageKey);
  if (!storedProjects) return createInitialProjects();

  try {
    const parsedProjects: unknown = JSON.parse(storedProjects);
    return Array.isArray(parsedProjects)
      ? parsedProjects.map((project) => {
          const { name: legacyName, ...projectData } = project as Project & {
            name?: unknown;
          };

          return {
            ...projectData,
            title:
              typeof projectData.title === "string"
                ? projectData.title
                : typeof legacyName === "string"
                  ? legacyName
                  : "",
          };
        })
      : [];
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
    projectParticipants: project.projectParticipants?.map((participant) => ({
      ...participant,
    })),
  }));
}

export const useApp = () => useContext(AppContext);
