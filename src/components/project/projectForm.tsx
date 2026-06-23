import { useState } from "react";
import { Paperclip, UserPlus } from "lucide-react";
import { AvatarChip } from "./avatarChip";
import {
  PARTICIPANTS,
  type Participant,
} from "../context/context";

interface ProjectFormData {
  title: string;
  participants: Participant[];
  notionUrl: string;
}

interface ProjectFormProps {
  initial: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel: string;
  head: string;
}

export function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  head,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [participants, setParticipants] = useState<Participant[]>(
    initial.participants,
  );
  const [notionUrl, setNotionUrl] = useState(initial.notionUrl);
  const [showParticipantAdd, setShowParticipantAdd] = useState(false);

  const availableParticipants = PARTICIPANTS.filter(
    (participant) =>
      !participants.find(
        (selectedParticipant) => selectedParticipant.id === participant.id,
      ),
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex items-center justify-center border-b border-border px-10 py-5">
        <h1 className="text-[18px] font-semibold">{title}</h1>
        <div className="absolute right-10 flex gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onSubmit({ title, participants, notionUrl })}
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
              value={head}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="프로젝트 이름을 입력하세요"
              className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="flex items-start gap-6">
            <label className="mt-1 w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              참여자
            </label>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {participants.map((participant) => (
                <AvatarChip
                  key={participant.id}
                  participant={participant}
                  onRemove={() =>
                    setParticipants(
                      participants.filter(
                        (selectedParticipant) =>
                          selectedParticipant.id !== participant.id,
                      ),
                    )
                  }
                />
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowParticipantAdd(!showParticipantAdd)}
                  className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40"
                >
                  <UserPlus size={12} />
                  추가
                </button>
                {showParticipantAdd && availableParticipants.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-36 rounded-xl border border-border bg-white py-1 shadow-lg">
                    {availableParticipants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => {
                          setParticipants([...participants, participant]);
                          setShowParticipantAdd(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted"
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: participant.color }}
                        >
                          {participant.initials[0]}
                        </div>
                        {participant.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

          <div className="flex items-start gap-6">
            <label className="mt-1 w-24 shrink-0 text-right text-sm font-semibold text-foreground/60">
              파일 첨부
            </label>
            <div className="flex-1">
              <div className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-white px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30">
                <Paperclip size={14} />
                <span>+ 파일을 선택하거나 드래그</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
