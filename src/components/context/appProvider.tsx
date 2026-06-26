import { useRef, useState } from "react";
import { AppContext } from "./appContext";
import type { Project } from "../../types/project";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [, setSummaryTab] = useState<"full" | "tasks">("full");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  return (
    <AppContext.Provider
      value={{
        projects,
        setProjects,
        setSummaryTab,
        elapsed,
        setElapsed,
        timerRef,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
