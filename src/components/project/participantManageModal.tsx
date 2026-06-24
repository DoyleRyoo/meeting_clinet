import { useEffect, useMemo, useState } from "react";
import {
  MOCK_USERS,
  projectParticipantStatus,
  projectParticipantStatusLabel,
  type Participant,
  type ProjectParticipantStatus,
} from "../context/context";

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

function searchUsersByEmailMock(
  query: string,
  participantIds: string[],
): SearchableUser[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return MOCK_USERS.filter(
    (user) =>
      user.userEmail.toLowerCase().includes(normalizedQuery) &&
      !participantIds.includes(user.userId),
  ).map((user) => ({
    userId: user.userId,
    name: user.userName,
    email: user.userEmail,
    department: user.userDepartment,
    profileImage: user.userProfileImage,
    status: user.userStatus ? "ACTIVE" : "INACTIVE",
  }));
}

function deleteParticipantMock(
  participants: Participant[],
  participantId: string,
): Participant[] {
  return participants.filter((participant) => participant.id !== participantId);
}

function updateParticipantStatusMock(
  participants: Participant[],
  participantId: string,
  status: ProjectParticipantStatus,
): Participant[] {
  return participants.map((participant) =>
    participant.id === participantId
      ? { ...participant, projectMemberStatus: status }
      : participant,
  );
}
// ===== 삭제 끝: 참가자 관리 Mock 코드 =====

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
  const participantIds = useMemo(
    () => temporaryParticipants.map((participant) => participant.id),
    [temporaryParticipants],
  );

  useEffect(() => {
    if (!isOpen) return;
    setEmailQuery("");
    setSearchResults([]);
    setActiveParticipantId(null);
    setTemporaryParticipants(initialParticipants.map((participant) => ({ ...participant })));
  }, [initialParticipants, isOpen]);

  useEffect(() => {
    // 실제 백엔드와 연결에 사용되는 코드입니다
    // 백엔드 프로젝트 참가자 목록 조회 API 연동 완료 후 주석을 해제하여 사용합니다.
    // const response = await axios.get("/participant/list", { params: { pid: projectId } });
    // return response.data;
    setSearchResults(searchUsersByEmailMock(emailQuery, participantIds));
  }, [emailQuery, participantIds, projectId]);

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

  const handleRemove = (participant: Participant) => {
    // 실제 백엔드와 연결에 사용되는 코드입니다
    // 백엔드 프로젝트 참가자 제외 API 연동 완료 후 주석을 해제하여 사용합니다.
    // await axios.delete("/participant", { data: { projectMemberId: participant.projectMemberId } });
    setTemporaryParticipants((participants) =>
      deleteParticipantMock(participants, participant.id),
    );
    setActiveParticipantId(null);
  };

  const handleStatusChange = (
    participant: Participant,
    status: ProjectParticipantStatus,
  ) => {
    // 실제 백엔드와 연결에 사용되는 코드입니다
    // 백엔드 프로젝트 참가자 상태 수정 API 연동 완료 후 주석을 해제하여 사용합니다.
    // await axios.patch("/participant/status", { projectMemberId: participant.projectMemberId, status });
    setTemporaryParticipants((participants) =>
      updateParticipantStatusMock(participants, participant.id, status),
    );
    setActiveParticipantId(null);
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
                          {participant.email ?? `${participant.id}@example.com`}
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
                          onClick={() => handleRemove(participant)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          참가자 제거
                        </button>
                        {([projectParticipantStatus.active, projectParticipantStatus.left, projectParticipantStatus.removed] as const).map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(participant, status)}
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
