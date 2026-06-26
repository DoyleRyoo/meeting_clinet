import { createContext } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";
import type { Project } from "../../types/project";

export interface AppContextValue {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setSummaryTab: Dispatch<SetStateAction<"full" | "tasks">>;
  elapsed: number;
  setElapsed: Dispatch<SetStateAction<number>>;
  timerRef: MutableRefObject<ReturnType<typeof setInterval> | null>;
}

export const AppContext = createContext<AppContextValue>(null!);
