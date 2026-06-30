import { useEffect, useState } from "react";
import { ChevronDown, Folder, Plus } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../stores/authStore";
import { ProfileEditModal } from "../components/auth/profileEditModal";
import { CompanyManagementModal } from "../components/company/companyManagementModal";
import { getProjectList, mapProjectListResponse } from "../apis/projectApi";
import type { ProjectStatus, ProjectView } from "../apis/apiTypes";

const projectStatusColor: Record<
  ProjectStatus,
  { active: string; inactive: string }
> = {
  ACTIVE: { active: "#22C55E", inactive: "#86EFAC" },
  COMPLETED: { active: "#3B82F6", inactive: "#93C5FD" },
  ARCHIVED: { active: "#6B7280", inactive: "#D1D5DB" },
};

export function RootPageLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [projects, setProjects] = useState<ProjectView[]>([]);
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const logout = useAuthStore((state) => state.logout);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isCompanyManagementOpen, setIsCompanyManagementOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;

    async function loadProjects() {
      try {
        const response = await getProjectList();
        if (!ignore) setProjects(mapProjectListResponse(response));
      } catch (error) {
        console.error("Failed to load project list", error);
      }
    }

    void loadProjects();
    return () => {
      ignore = true;
    };
  }, [isAuthenticated, pathname]);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  const handleProfileEditOpen = () => {
    setIsProfileMenuOpen(false);
    setIsProfileEditOpen(true);
  };

  const handleCompanyManagementOpen = () => {
    setIsProfileMenuOpen(false);
    setIsCompanyManagementOpen(true);
  };

  const getProjectStatusColor = (
    status: unknown,
    isActive: boolean,
  ) => {
    const safeStatus: ProjectStatus =
      status === "ACTIVE" ||
      status === "COMPLETED" ||
      status === "ARCHIVED"
        ? status
        : "ACTIVE";

    return projectStatusColor[safeStatus][isActive ? "active" : "inactive"];
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background"
      style={{
        fontFamily: "'Pretendard', system-ui, -apple-system, sans-serif",
      }}
    >
      <aside className="flex h-full w-[240px] shrink-0 select-none flex-col border-r border-border bg-white">
        <div className="border-b border-border px-4 py-4">
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isProfileMenuOpen}
                className="flex w-full items-center gap-2.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber-400 text-sm font-semibold text-white">
                  {oauthUser?.profileImage ? (
                    <img
                      src={oauthUser.profileImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "진"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{oauthUser?.name ?? "진상현"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {oauthUser?.email ?? "test@gmail.com"}
                  </p>
                </div>
                <span className="text-muted-foreground transition-colors hover:text-foreground">
                  <ChevronDown size={14} />
                </span>
              </button>
              {isProfileMenuOpen && (
                <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-border bg-white p-1 shadow-lg transition-all">
                  <button
                    type="button"
                    onClick={handleProfileEditOpen}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    프로필
                  </button>
                  <button
                    type="button"
                    onClick={handleCompanyManagementOpen}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    회사 관리
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              로그인하기
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-4 pb-1 pt-4">
          <button className="flex items-center gap-1 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground">
            Projects
            <ChevronDown size={13} />
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-4">
          {(isAuthenticated ? projects : []).map((project) => {
            const active =
              pathname === `/projects/${project.id}` ||
              pathname === `/projects/${project.id}/update`;

            return (
              <button
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  active
                    ? "bg-primary/8 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <Folder
                  size={15}
                  className={active ? "text-amber-500" : "text-amber-400"}
                  fill={getProjectStatusColor(project.projectStatus, active)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {project.title}
                  </p>
                  {project.meetings.length > 0 && (
                    <p className="truncate text-xs text-muted-foreground">
                      {project.meetings[project.meetings.length - 1].title}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
      {isProfileEditOpen && (
        <ProfileEditModal onClose={() => setIsProfileEditOpen(false)} />
      )}
      <CompanyManagementModal
        isOpen={isCompanyManagementOpen}
        onClose={() => setIsCompanyManagementOpen(false)}
      />
    </div>
  );
}
