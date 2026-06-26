import { Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import type { ActionItem, FullSummarySection as ApiFullSummarySection } from "../apis/apiTypes";
import {
  getActionItems,
  getFullSummary,
  getShortSummary,
  mapActionItemsResponse,
  mapFullSummaryResponse,
  mapShortSummaryResponse,
  toActionItemUpdatePayload,
  toFullSummaryUpdatePayload,
  updateActionItems,
  updateFullSummary,
  updateShortSummary,
} from "../apis/meetingApi";
import { useApp } from "../components/context/useApp";
import { ActionItemsSection } from "../components/summary/actionItemsSection";
import { FullSummarySection } from "../components/summary/fullSummarySection";
import { ShortSummarySection } from "../components/summary/shortSummarySection";
import type { EditableFullSummarySection } from "../components/summary/summaryEditorTypes";
import { useSummaryStore } from "../store/summaryStore";
import { getNowStrings } from "../utils/dateTime";

type SummaryTab = "short" | "full" | "action";
type SummaryLocationState = {
  meetingId?: string;
};
type ProjectParticipantRef = {
  projectMemberId: string;
  title?: string;
  email?: string | null;
};

const createId = () => String(Date.now()) + "-" + Math.random().toString(36).slice(2);
const createEmptySection = (): EditableFullSummarySection => ({
  id: createId(),
  contextTitle: "",
  context: [{
    id: createId(),
    value: "",
  }],
});
const toEditableSections = (sections: ApiFullSummarySection[]): EditableFullSummarySection[] => sections.length ? sections.map(
  (section) => ({
    id: createId(),
    contextTitle: section.contextTitle,
    context: section.context.length ? section.context.map(
      (value) => ({
        id: createId(),
        value,
      })
    ) : [{ id: createId(), value: "" }],
  })
) : [createEmptySection()];
const toFullSummaryPayload = (
  sections: EditableFullSummarySection[],
): ApiFullSummarySection[] => sections.map(
  (section) => ({
    contextTitle: section.contextTitle.trim() || "제목 없음",
    context: section.context.map((item) => item.value.trim()).filter(Boolean),
  })
).filter(
  (section) => section.context.length > 0 || section.contextTitle !== "제목 없음",
);

function resolveActionItemParticipant(
  item: ActionItem,
  participants: ProjectParticipantRef[],
): ProjectParticipantRef | undefined {
  if (item.projectMemberId) {
    const matchedById = participants.find((participant) => participant.projectMemberId === item.projectMemberId);
    if (matchedById) return matchedById;
  }

  if (item.assigneeEmail) {
    const matchedByEmail = participants.find((participant) => participant.email === item.assigneeEmail);
    if (matchedByEmail) return matchedByEmail;
  }

  if (item.assigneeName) {
    const matchedByName = participants.find((participant) => participant.title === item.assigneeName);
    if (matchedByName) return matchedByName;
  }

  return undefined;
}

function normalizeActionItem(
  item: ActionItem,
  participants: ProjectParticipantRef[],
): ActionItem {
  const matchedParticipant = resolveActionItemParticipant(item, participants);

  return {
    ...item,
    projectMemberId: item.projectMemberId ?? matchedParticipant?.projectMemberId,
    assigneeName: item.assigneeName || matchedParticipant?.title || "",
    assigneeEmail: item.assigneeEmail || matchedParticipant?.email || "",
  };
}

function normalizeActionItems(
  items: ActionItem[],
  participants: ProjectParticipantRef[],
): ActionItem[] {
  return items.map((item) => normalizeActionItem(item, participants));
}

function createDefaultActionItem(
  meetingId: string,
  participants: ProjectParticipantRef[],
): ActionItem {
  const defaultParticipant = participants[0];

  return {
    actionItemId: createId(),
    meetingId,
    projectMemberId: defaultParticipant?.projectMemberId,
    assigneeName: defaultParticipant?.title ?? "",
    assigneeEmail: defaultParticipant?.email ?? "",
    task: "",
    startDate: "",
    dueDate: "",
    priority: "MEDIUM",
    status: "미착수",
  };
}

export function SummaryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pid } = useParams<{ pid: string }>();
  const { projects } = useApp();
  const meetingContext = useSummaryStore((state) => state.meetingContext);
  const selectedProject = projects.find((currentProject) => currentProject.id === pid);
  const projectParticipants = selectedProject?.projectParticipants ?? [];
  const locationState = location.state as SummaryLocationState | null;
  const resolvedMeetingId =
    locationState?.meetingId ??
    meetingContext.meetingId ??
    selectedProject?.meetings.at(-1)?.id ??
    pid ??
    "";
  const currentMeeting = selectedProject?.meetings.find((meeting) => meeting.id === resolvedMeetingId);
  const { dateString } = getNowStrings();
  const meetingTitle = currentMeeting?.title ??
    (selectedProject
      ? `${dateString.replace(/\./g, "").slice(2)} ${selectedProject.meetings.length + 1}차 회의`
      : `${dateString.replace(/\./g, "").slice(2)} 1차 회의`);
  const [shortSummary, setShortSummary] = useState("");
  const [sections, setSections] = useState(() => toEditableSections([]));
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [activeTab, setActiveTab] = useState<SummaryTab>("short");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!resolvedMeetingId) return;
    let ignore = false;

    async function loadMeetingSummaries() {
      try {
        const [shortResponse, fullResponse, actionResponse] = await Promise.all([
          getShortSummary(resolvedMeetingId),
          getFullSummary(resolvedMeetingId),
          getActionItems(resolvedMeetingId),
        ]);
        if (ignore) return;
        setShortSummary(mapShortSummaryResponse(shortResponse));
        setSections(toEditableSections(mapFullSummaryResponse(fullResponse)));
        setActionItems(normalizeActionItems(mapActionItemsResponse(actionResponse), projectParticipants));
        setErrorMessage(null);
      } catch (error) {
        if (ignore) return;
        setErrorMessage(
          error instanceof Error ? error.message : "회의 요약을 불러오지 못했습니다.",
        );
      }
    }

    void loadMeetingSummaries();
    return () => {
      ignore = true;
    };
  }, [projectParticipants, resolvedMeetingId]);

  useEffect(() => {
    setActionItems((current) => normalizeActionItems(current, projectParticipants));
  }, [projectParticipants]);

  const updateSection = (
    sectionId: string,
    update: (section: EditableFullSummarySection) => EditableFullSummarySection,
  ) => setSections(
    (current) => current.map(
      (section) => section.id === sectionId ? update(section) : section,
    ),
  );

  const removeSection = (sectionId: string) => setSections(
    (current) => {
      const next = current.filter((section) => section.id !== sectionId);
      return next.length ? next : [createEmptySection()];
    },
  );

  const removeItem = (sectionId: string, itemId: string) => updateSection(
    sectionId, (section) => {
      const next = section.context.filter((item) => item.id !== itemId);

      return {
        ...section,
        context: next.length ? next : [{
          id: createId(),
          value: "",
        }],
      };
    },
  );

  const addSection = () => setSections((current) => [...current, createEmptySection()]);

  const addItem = (sectionId: string) => updateSection(
    sectionId, (current) => ({
      ...current,
      context: [
        ...current.context,
        { id: createId(), value: "" },
      ],
    })
  );

  const save = async () => {
    if (!resolvedMeetingId || isSaving) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateShortSummary(resolvedMeetingId, shortSummary.trim()),
        updateFullSummary(resolvedMeetingId, toFullSummaryUpdatePayload(toFullSummaryPayload(sections))),
        updateActionItems(resolvedMeetingId, toActionItemUpdatePayload(resolvedMeetingId, actionItems)),
      ]);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회의 요약을 저장하지 못했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateAction = (id: string | undefined, patch: Partial<ActionItem>) => setActionItems(
      (items) => items.map(
        (item) => item.actionItemId === id ? { ...item, ...patch } : item,
    ),
  );

  const addActionItem = () => setActionItems((items) => [
    ...items,
    createDefaultActionItem(resolvedMeetingId, projectParticipants),
  ]);

  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="relative flex items-center justify-center border-b border-border px-10 py-5">
      <h1 className="text-[18px] font-semibold">{meetingTitle}</h1>
      <div className="absolute right-10 flex gap-2">
        <button
          onClick={() => void save()}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save size={14} />
          저장
        </button>

        <button
          onClick={() => navigate(`/projects/${pid}/record/uploading`)}
          className="flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground/70"
        >
          <Upload size={14} />
          회의 업로드
        </button>
      </div>
    </div>
    {errorMessage && (
      <p className="border-b border-border bg-destructive/10 px-10 py-2 text-sm text-destructive">
        {errorMessage}
      </p>
    )}
    <div className="border-b border-border px-10">
      <div className="mx-auto flex w-full max-w-[900px] gap-1">
        {([["short", "한 줄 요약"], ["full", "전체 요약"], ["action", "할 일 요약"]] as const).map(
          ([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold transition-colors ${activeTab === tab ?
                "border-b-2 border-foreground text-foreground" :
                "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>
    </div>
    <div className="flex flex-1 justify-center overflow-y-auto px-10 py-8">
      <div className="w-full max-w-[900px] space-y-8">
      {activeTab === "short" && (
        <ShortSummarySection
          shortSummary={shortSummary}
          onChange={setShortSummary}
        />
      )}

      {activeTab === "full" && (
        <FullSummarySection
          sections={sections}
          onAddSection={addSection}
          onUpdateSection={updateSection}
          onRemoveSection={removeSection}
          onRemoveItem={removeItem}
          onAddItem={addItem}
        />
      )}

      {activeTab === "action" && (
        <ActionItemsSection
          actionItems={actionItems}
          onAddActionItem={addActionItem}
          onUpdateAction={updateAction}
        />
      )}
    </div></div>
  </div>;
}
