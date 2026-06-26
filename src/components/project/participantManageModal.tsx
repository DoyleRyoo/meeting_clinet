import { useEffect, useMemo, useState } from "react";
import {
  projectParticipantStatus,
  type Participant,
  type ProjectParticipantStatus,
  type UserDto,
} from "../../apis/apiTypes";
import {
  deleteParticipant,
  updateParticipantStatus,
} from "../../apis/participantApi";
import { getUserList } from "../../apis/userApi";

const projectParticipantStatusLabel: Record<ProjectParticipantStatus, string> = {
  ACTIVE: "참가중",
  LEFT: "프로젝트 미참가",
  REMOVED: "퇴사",
};

interface SearchableUser {
  userId: string;
  name: string;
  email: string;
  department?: string;
  grade?: string;
  position?: string;
  profileImage: string | null;
  status: string;
}

interface ParticipantManageModalProps {
  isOpen: boolean;
  projectId?: string;
  initialParticipants: Participant[];
  onClose: () => void;
  onComplete: (participants: Participant[]) => void;
}

function mapUserToSearchableUser(user: UserDto): SearchableUser {
  return {
    userId: String(user.user_id),
    name: user.user_name,
    email: user.user_email,
    department: user.user_department,
    position: user.user_role,
    profileImage: user.user_profile_image,
    status: String(user.user_status),
  };
}

export function ParticipantManageModal({
  isOpen,
  projectId,
  initialParticipants,
  onClose,
  onComplete,
}: ParticipantManageModalProps) {
  const [emailQuery, setEmailQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [temporaryParticipants, setTemporaryParticipants] = useState<Participant[]>([]);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const participantIds = useMemo(
    () => temporaryParticipants.map((participant) => participant.id),
    [temporaryParticipants],
  );

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => {
      setEmailQuery("");
      setSearchResults([]);
      setErrorMessage(null);
      setActiveParticipantId(null);
      setTemporaryParticipants(initialParticipants.map((participant) => ({ ...participant })));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialParticipants, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const normalizedQuery = emailQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      const timeoutId = window.setTimeout(() => setSearchResults([]), 0);
      return () => window.clearTimeout(timeoutId);
    }

    let ignore = false;

    async function loadUsers() {
      try {
        const users = await getUserList<UserDto[]>();
        if (ignore) return;
        setSearchResults(
          users
            .filter(
              (user) =>
                user.user_email.toLowerCase().includes(normalizedQuery) &&
                !participantIds.includes(String(user.user_id)),
            )
            .map(mapUserToSearchableUser),
        );
        setErrorMessage(null);
      } catch (error) {
        if (ignore) return;
        setSearchResults([]);
        setErrorMessage(
          error instanceof Error ? error.message : "사용자 목록을 불러오지 못했습니다.",
        );
      }
    }

    void loadUsers();
    return () => {
      ignore = true;
    };
  }, [emailQuery, isOpen, participantIds, projectId]);

  const handleAddUser = (user: SearchableUser) => {
    setTemporaryParticipants((participants) => [
      ...participants,
      {
        id: user.userId,
        title: user.name,
        initials: user.name.slice(0, 2),
        color: "#6B7280",
        email: user.email,
        profileImage: user.profileImage,
        projectMemberRole: "MEMBER",
        projectMemberGrade: "MEMBER",
        projectMemberStatus: projectParticipantStatus.active,
      },
    ]);
  };

  const handleRemove = async (participant: Participant) => {
    try {
      if (participant.projectMemberId) {
        await deleteParticipant({ project_member_id: participant.projectMemberId });
      }
      setTemporaryParticipants((participants) =>
        participants.filter((current) => current.id !== participant.id),
      );
      setActiveParticipantId(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "참가자를 제거하지 못했습니다.",
      );
    }
  };

  const handleStatusChange = async (
    participant: Participant,
    status: ProjectParticipantStatus,
  ) => {
    try {
      if (participant.projectMemberId) {
        await updateParticipantStatus({
          project_member_id: participant.projectMemberId,
          project_status: status,
        });
      }
      setTemporaryParticipants((participants) =>
        participants.map((current) =>
          current.id === participant.id
            ? { ...current, projectMemberStatus: status }
            : current,
        ),
      );
      setActiveParticipantId(null);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "참가자 상태를 변경하지 못했습니다.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-manage-title"
        className="flex h-[560px] w-[900px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 id="participant-manage-title" className="text-lg font-semibold">
          참가자 관리
        </h2>
        {errorMessage && (
          <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 gap-5">
          <section className="flex min-h-0 flex-col border-r border-border pr-5">
            <label className="text-sm font-medium">이메일로 사용자 검색</label>
            <input
              autoFocus
              value={emailQuery}
              onChange={(event) => setEmailQuery(event.target.value)}
              placeholder="이메일을 입력하세요"
              className="mt-2 h-10 rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
            />
            {emailQuery && (
              <div className="mt-2 max-h-[280px] overflow-y-auto rounded-lg border border-border">
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      onClick={() => handleAddUser(user)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                    >
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    일치하는 사용자가 없습니다.
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="flex min-h-0 flex-col">
            <p className="text-sm font-medium">현재 참가자 ({temporaryParticipants.length})</p>
            <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
              {temporaryParticipants.map((participant) => {
                const isActive = activeParticipantId === participant.id;
                return (
                  <div key={participant.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveParticipantId((activeId) =>
                          activeId === participant.id ? null : participant.id,
                        )
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <ParticipantAvatar participant={participant} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{participant.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {participant.email ?? ""}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">
                        {participant.projectMemberRole ?? "MEMBER"} · {projectParticipantStatusLabel[participant.projectMemberStatus ?? projectParticipantStatus.active]} · {participant.projectMemberGrade ?? "MEMBER"}
                      </p>
                    </button>
                    {isActive && (
                      <div className="ml-11 mr-2 flex flex-wrap items-center gap-1 border-t border-border px-2 py-2">
                        <button
                          type="button"
                          onClick={() => void handleRemove(participant)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          참가자 제거
                        </button>
                        {([projectParticipantStatus.active, projectParticipantStatus.left, projectParticipantStatus.removed] as const).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => void handleStatusChange(participant, status)}
                              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {projectParticipantStatusLabel[status]}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onComplete(temporaryParticipants)}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground/80"
          >
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ user }: { user: SearchableUser }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {user.profileImage ? (
        <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
      ) : (
        user.name.slice(0, 2)
      )}
    </div>
  );
}

function ParticipantAvatar({ participant }: { participant: Participant }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {participant.profileImage ? (
        <img src={participant.profileImage} alt="" className="h-full w-full object-cover" />
      ) : (
        participant.initials.slice(0, 2)
      )}
    </div>
  );
}
