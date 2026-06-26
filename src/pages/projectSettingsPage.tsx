import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getProjectDetail as getProjectDetailApi,
  mapProjectDetailResponse,
  mapProjectResponseToProject,
  updateProjectApi,
  type UpdateProjectRequest,
} from "../apis/projectApi";
import type { ProjectDetailResponse } from "../apis/apiTypes";
import { useApp } from "../components/context/useApp";
import { ProjectForm } from "../components/project/projectForm";

export function ProjectSettingsPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const { projects, setProjects } = useApp();
  const [projectDetail, setProjectDetail] = useState<ProjectDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedProject = projects.find(
    (project) => project.id === pid || project.projectId === pid,
  );

  useEffect(() => {
    if (!pid) return;
    const projectId = pid;
    let ignore = false;

    async function loadProjectDetail() {
      try {
        const response = await getProjectDetailApi(projectId);
        if (ignore) return;
        setProjectDetail(mapProjectDetailResponse(response));
        setErrorMessage(null);
      } catch (error) {
        if (ignore) return;
        setProjectDetail(null);
        setErrorMessage(
          error instanceof Error ? error.message : "프로젝트 상세를 불러오지 못했습니다.",
        );
      }
    }

    void loadProjectDetail();
    return () => {
      ignore = true;
    };
  }, [pid]);

  if (!projectDetail) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {errorMessage ?? "프로젝트를 불러오는 중입니다."}
        </p>
      </div>
    );
  }

  return (
    <>
      {errorMessage && (
        <p className="border-b border-border bg-destructive/10 px-10 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <ProjectForm
        projectId={projectDetail.projectId}
        headerTitle="프로젝트 설정 변경"
        initial={{
          title: projectDetail.title,
          description: projectDetail.description,
          participants: projectDetail.participants.map((participant) => ({
            id: participant.userId,
            title: participant.user.name,
            initials: participant.user.name.slice(0, 2),
            color: participant.color,
            email: participant.user.email,
            profileImage: participant.user.profileImage,
            projectMemberId: participant.projectMemberId,
            projectMemberRole: participant.projectMemberRole,
            projectMemberStatus: participant.projectMemberStatus,
            projectMemberGrade: participant.projectMemberGrade,
          })),
          notionUrl: selectedProject?.notionUrl ?? "",
        }}
        submitLabel="완료"
        cancelLabel="취소"
        onCancel={() => navigate(`/projects/${pid}`)}
        onSubmit={async ({ title, description, participants }) => {
          const updatedTitle = title.trim();
          if (!updatedTitle) return;

          const payload: UpdateProjectRequest = {
            project_title: updatedTitle,
            project_description: description,
            participants: participants.map((participant, index) => ({
              project_member_id: participant.projectMemberId,
              user_id: participant.id,
              project_member_role: participant.projectMemberRole ?? (index === 0 ? "OWNER" : "MEMBER"),
              project_member_grade: participant.projectMemberGrade ?? "MEMBER",
              project_status: participant.projectMemberStatus ?? "ACTIVE",
            })),
          };

          try {
            const response = await updateProjectApi(projectDetail.projectId, payload);
            const updatedProject = mapProjectResponseToProject(response);
            setProjects((previousProjects) =>
              previousProjects.map((project) =>
                project.id === updatedProject.id || project.projectId === updatedProject.projectId
                  ? { ...project, ...updatedProject }
                  : project,
              ),
            );
            navigate(`/projects/${pid}`);
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "프로젝트를 수정하지 못했습니다.",
            );
          }
        }}
      />
    </>
  );
}
