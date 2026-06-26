export type EditableSummaryItem = {
  id: string;
  value: string;
};

export type EditableFullSummarySection = {
  id: string;
  contextTitle: string;
  context: EditableSummaryItem[];
};
