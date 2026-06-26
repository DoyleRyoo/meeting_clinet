import { Plus } from "lucide-react";
import type { ActionItem } from "../../apis/apiTypes";

interface ActionItemsSectionProps {
  actionItems: ActionItem[];
  onAddActionItem: () => void;
  onUpdateAction: (id: string | undefined, patch: Partial<ActionItem>) => void;
}

export function ActionItemsSection({
  actionItems,
  onAddActionItem,
  onUpdateAction,
}: ActionItemsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          할 일 요약
        </h2>
        <button
          type="button"
          onClick={onAddActionItem}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <Plus size={14} />
          추가
        </button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              <th>담당자</th>
              <th>이메일</th>
              <th>업무</th>
              <th>시작일</th>
              <th>마감일</th>
              <th>우선순위</th>
              <th>상태</th>
            </tr>
          </thead>

          <tbody>{actionItems.map((item) =>
            <tr key={item.actionItemId} className="border-b border-border/70">
              <td className="py-2">
                <input
                  value={item.assigneeName}
                  onChange={(event) => onUpdateAction(item.actionItemId, { assigneeName: event.target.value })}
                  className="w-20 bg-transparent outline-none"
                />
              </td>
              <td>
                <input
                  value={item.assigneeEmail}
                  onChange={(event) => onUpdateAction(item.actionItemId, { assigneeEmail: event.target.value })}
                  className="w-36 bg-transparent outline-none"
                />
              </td>
              <td>
                <input
                  value={item.task}
                  onChange={(event) => onUpdateAction(item.actionItemId, { task: event.target.value })}
                  className="w-40 bg-transparent outline-none"
                />
              </td>
              <td>
                <input
                  type="date"
                  value={item.startDate}
                  onChange={(event) => onUpdateAction(item.actionItemId, { startDate: event.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td>
                <input
                  type="date"
                  value={item.dueDate}
                  onChange={(event) => onUpdateAction(item.actionItemId, { dueDate: event.target.value })}
                  className="bg-transparent outline-none"
                />
              </td>
              <td>
                <select
                  value={item.priority}
                  onChange={(event) => onUpdateAction(item.actionItemId, { priority: event.target.value as ActionItem["priority"] })}
                  className="bg-transparent outline-none"
                >
                  <option value="HIGH">높음</option>
                  <option value="MEDIUM">중간</option>
                  <option value="LOW">낮음</option>
                </select>
              </td>
              <td>
                <select
                  value={item.status}
                  onChange={(event) => onUpdateAction(item.actionItemId, { status: event.target.value as ActionItem["status"] })}
                  className="bg-transparent outline-none"
                >
                  <option>미착수</option>
                  <option>진행중</option>
                  <option>완료</option>
                </select>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
