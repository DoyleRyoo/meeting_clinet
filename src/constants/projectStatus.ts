export const projectStatus = {
  active: "ACTIVE",
  completed: "COMPLETED",
  archived: "ARCHIVED",
} as const;

export type ProjectStatus = (typeof projectStatus)[keyof typeof projectStatus];
