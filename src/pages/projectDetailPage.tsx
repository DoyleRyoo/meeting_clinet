import { ChevronRight, Folder } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getProjectDetail,
  projectStatus,
  projectStatusColor,
  projectStatusLabel,
  type ProjectStatus,
  updateProjectStatus,
  useApp,
} from "../components/context/context";

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const { projects, setProjects } = useApp();
  const [isStatusSelectorOpen, setIsStatusSelectorOpen] = useState(false);

  const selectedProject = projects.find((project) => project.id === pid);
  const projectDetail = getProjectDetail(pid ?? "", projects);

  const handleProjectStatusChange = (nextStatus: ProjectStatus) => {
    if (!projectDetail || nextStatus === projectDetail.status) {
      setIsStatusSelectorOpen(false);
      return;
    }
    const updatedProject = updateProjectStatus(projectDetail.projectId, nextStatus, projects);
    if (updatedProject) {
      setProjects((currentProjects) => currentProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      ));
    }
    setIsStatusSelectorOpen(false);
  };

  if (!selectedProject || !projectDetail) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          프로젝트를 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative flex items-center justify-center border-b border-border px-10 py-6">
        <h1 className="text-[22px] font-semibold">{projectDetail.title}</h1>
        <div className="absolute right-10">
          <button
            onClick={() => navigate(`/projects/${pid}/update`)}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            프로젝트 설정
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-6 py-6">
        <div className="flex h-full justify-center">
          <div className="grid h-full min-h-0 w-full max-w-[1200px] grid-cols-1 grid-rows-2 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:grid-rows-1">
            <section className="min-h-0 overflow-y-auto">
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">프로젝트 정보</h2>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsStatusSelectorOpen((isOpen) => !isOpen)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${projectStatusColor[projectDetail.status].badgeClassName}`}
                        >
                          {projectStatusLabel[projectDetail.status]}
                        </button>
                        {isStatusSelectorOpen && (
                          <div className="absolute right-0 top-full z-10 mt-2 w-28 rounded-lg border border-border bg-white p-1 shadow-lg">
                            {([projectStatus.active, projectStatus.completed, projectStatus.archived] as const).map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleProjectStatusChange(status)}
                                className={`w-full rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${status === projectDetail.status ? "bg-muted font-semibold" : ""}`}
                              >
                                {projectStatusLabel[status]}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      참가자 {projectDetail.participants.length}명
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/projects/${pid}/update`)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
                  >
                    관리
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {projectDetail.description || "프로젝트 설명이 없습니다."}
                </p>
              </div>
            </section>

            <section className="min-h-0 overflow-y-auto">
              <div className="space-y-2">
                {[...selectedProject.meetings].reverse().map((meeting) => (
                  <button
                    key={meeting.id}
                    // 테스트 단계에서만 사용하는 코드입니다. 추후 백엔드 회의 상세 조회 API 연동 시 교체가 필요합니다.
                    onClick={() => navigate(`/projects/${pid}/record/summary`)}
                    className="group flex w-full items-center gap-3.5 rounded-xl border border-border bg-white px-4 py-4 transition-all hover:shadow-sm"
                  >
                    <Folder
                      size={18}
                      className="shrink-0 text-amber-400"
                      fill="#FCD34D"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-[15px] font-semibold">
                        {meeting.date.replace(/\./g, "")} {meeting.title}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </button>
                ))}
                {selectedProject.meetings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <p className="text-sm font-light">아직 회의가 없습니다.</p>
                    <p className="mt-1 text-sm font-light">
                      아래 버튼으로 첫 번째 회의를 시작해보세요.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="flex justify-center border-t border-border pb-10 pt-4">
        <button
          onClick={() => navigate(`/projects/${pid}/record`)}
          className="flex items-center gap-2 rounded-full bg-destructive px-7 py-3 text-sm font-semibold text-white shadow shadow-destructive/25 transition-all hover:bg-destructive/90 active:scale-95"
        >
          + 회의 시작하기
        </button>
      </div>
    </div>
  );
}
