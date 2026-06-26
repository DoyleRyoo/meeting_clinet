import { useState } from "react";
import { useNavigate } from "react-router";
import { createProject, mapProjectResponseToProject } from "../apis/projectApi";
import { ProjectForm } from "../components/project/projectForm";
import { useApp } from "../components/context/useApp";
import { useAuthStore } from "../stores/authStore";

export function NewProjectPage() {
  const navigate = useNavigate();
  const { setProjects } = useApp();
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <>
      {errorMessage && (
        <p className="border-b border-border bg-destructive/10 px-10 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      )}
      <ProjectForm
        headerTitle="새로운 프로젝트"
        initial={{
          title: "New Project",
          description: "",
          participants: [],
          notionUrl: "",
        }}
        submitLabel="회의 시작하기"
        cancelLabel="취소"
        onCancel={() => navigate("/")}
        onSubmit={async ({ title, description, participants, notionUrl }) => {
          const projectTitle = title.trim();
          if (!projectTitle) return;

          try {
            const response = await createProject({
              company_id: oauthUser?.companyId,
              project_title: projectTitle,
              project_description: description,
              notion_url: notionUrl,
              participants: participants.map((participant, index) => ({
                project_member_id: participant.projectMemberId,
                user_id: participant.id,
                project_member_role: participant.projectMemberRole ?? (index === 0 ? "OWNER" : "MEMBER"),
                project_member_grade: participant.projectMemberGrade ?? "MEMBER",
                project_status: participant.projectMemberStatus ?? "ACTIVE",
              })),
            });
            const newProject = mapProjectResponseToProject(response);
            setProjects((previousProjects) => [...previousProjects, newProject]);
            navigate(`/projects/${newProject.id}/record`);
          } catch (error) {
            setErrorMessage(
              error instanceof Error ? error.message : "프로젝트를 생성하지 못했습니다.",
            );
          }
        }}
      />
    </>
  );
}
