import { Plus, Trash2 } from "lucide-react";
import type { EditableFullSummarySection } from "./summaryEditorTypes";

interface FullSummarySectionProps {
  sections: EditableFullSummarySection[];
  onAddSection: () => void;
  onUpdateSection: (
    sectionId: string,
    update: (section: EditableFullSummarySection) => EditableFullSummarySection,
  ) => void;
  onRemoveSection: (sectionId: string) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
  onAddItem: (sectionId: string) => void;
}

export function FullSummarySection({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onRemoveItem,
  onAddItem,
}: FullSummarySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          전체 요약
        </h2>
        <button
          type="button"
          onClick={onAddSection}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <Plus size={14} />
          섹션 추가
        </button>
      </div>

      <div className="mt-4 space-y-5">{sections.map((section) =>
        <div key={section.id} className="rounded-lg border border-border p-4">
          <div className="flex gap-2">
            <input
              value={section.contextTitle}
              onChange={(event) => onUpdateSection(section.id, (current) => ({ ...current, contextTitle: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !section.contextTitle && section.context.every((item) => !item.value.trim())) {
                  event.preventDefault();
                  onRemoveSection(section.id);
                }
              }}
              placeholder="섹션 제목"
              className="h-9 flex-1 rounded-md border border-border px-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => onRemoveSection(section.id)}
              className="rounded-md p-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <div className="mt-3 space-y-2">{section.context.map(
            (item) =>
              <div key={item.id} className="flex gap-2">
                <textarea
                  value={item.value}
                  onChange={(event) => onUpdateSection(section.id, (current) => ({
                    ...current,
                    context: current.context.map((currentItem) => currentItem.id === item.id ? {
                      ...currentItem,
                      value: event.target.value,
                    } : currentItem),
                  }))}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !item.value) {
                      event.preventDefault();
                      onRemoveItem(section.id, item.id);
                    }
                  }}
                  rows={2}
                  className="flex-1 resize-none rounded-md border border-border px-2 py-1.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => onRemoveItem(section.id, item.id)}
                  className="rounded-md p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onAddItem(section.id)}
            className="mt-3 flex items-center gap-1 text-sm text-primary"
          >
            <Plus size={14} />
            항목 추가
          </button>
        </div>)}
      </div>
    </section>
  );
}
