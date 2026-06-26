import type { ProjectParticipantStatus } from "../constants/projectParticipantStatus";

export interface Participant {
  id: string;
  title: string;
  initials: string;
  color: string;
  email?: string;
  profileImage?: string | null;
  projectMemberId?: string;
  projectMemberRole?: string;
  projectMemberStatus?: ProjectParticipantStatus;
  projectMemberGrade?: string;
}

export interface ProjectParticipant extends Participant {
  projectMemberId: string;
  projectId: string;
  userId: string;
  projectMemberRole: string;
  projectMemberCreatedAt: string;
  projectMemberUpdatedAt: string;
  projectMemberStatus: ProjectParticipantStatus;
  projectMemberGrade: string;
}
