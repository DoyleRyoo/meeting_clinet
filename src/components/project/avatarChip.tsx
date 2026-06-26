import { X } from "lucide-react";
import type { Participant } from "../../types/participant";

interface AvatarChipProps {
  participant: Participant;
  onRemove?: () => void;
}

export function AvatarChip({ participant, onRemove }: AvatarChipProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-2.5 py-1 text-xs">
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
        style={{ backgroundColor: participant.color }}
      >
        {participant.initials[0]}
      </div>
      <span className="font-medium text-foreground/80">{participant.title}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X size={11} />
        </button>
      )}
    </div>
  );
}
