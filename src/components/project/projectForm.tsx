import { useState } from "react";
import { UserPlus } from "lucide-react";
import { ParticipantManageModal } from "./participantManageModal";
import type { Participant } from "../../apis/apiTypes";

interface ProjectFormData {
  title: string;
  description: string;
  participants: Participant[];
  notionUrl: string;
}

interface ProjectFormProps {
  projectId?: string;
  initial: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel: string;
  headerTitle: string;
}

export function ProjectForm({
  projectId,
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  headerTitle,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [participants, setParticipants] = useState<Participant[]>(
    initial.participants,
  );
  const [notionUrl, setNotionUrl] = useState(initial.notionUrl);
  const [isParticipantManageOpen, setIsParticipantManageOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex items-center justify-center border-b border-border px-10 py-5">
        <h1 className="text-[18px] font-semibold">{headerTitle}</h1>
        <div className="absolute right-10 flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onSubmit({ title, description, participants, notionUrl })}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground/80"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-10 pt-16">
        <div className="w-full max-w-lg space-y-6">
          <div className="flex items-center gap-6">
            <label className="w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              프로젝트 이름
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex items-start gap-6">
            <label className="mt-2 w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              프로젝트 설명
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="프로젝트 설명을 입력하세요"
              className="min-h-24 flex-1 resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              참가자
            </label>
            <div className="flex flex-1 items-center justify-between rounded-lg border border-border bg-white px-3 py-2">
              <p className="text-sm text-muted-foreground">{participants.length}명</p>
              <button
                type="button"
                onClick={() => setIsParticipantManageOpen(true)}
                className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40"
              >
                <UserPlus size={12} />
                관리
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              Notion URL
            </label>
            <input
              value={notionUrl}
              onChange={(event) => setNotionUrl(event.target.value)}
              placeholder="https://notion.so/..."
              className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>
        </div>
      </div>
      <ParticipantManageModal
        isOpen={isParticipantManageOpen}
        projectId={projectId}
        initialParticipants={participants}
        onClose={() => setIsParticipantManageOpen(false)}
        onComplete={(updatedParticipants) => {
          setParticipants(updatedParticipants);
          setIsParticipantManageOpen(false);
        }}
      />
    </div>
  );
}
