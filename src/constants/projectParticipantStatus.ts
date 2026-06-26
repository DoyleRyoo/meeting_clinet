export const projectParticipantStatus = {
  active: "ACTIVE",
  left: "LEFT",
  removed: "REMOVED",
} as const;

export type ProjectParticipantStatus =
  (typeof projectParticipantStatus)[keyof typeof projectParticipantStatus];
