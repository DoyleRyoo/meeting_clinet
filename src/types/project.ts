import type { ProjectStatus } from "../constants/projectStatus";
import type { Meeting } from "./meeting";
import type { Participant, ProjectParticipant } from "./participant";

export interface Project {
  id: string;
  projectId?: string;
  companyId?: string;
  title: string;
  projectDescription?: string;
  projectStatus?: ProjectStatus;
  projectCreatedAt?: string;
  projectUpdatedAt?: string;
  meetings: Meeting[];
  participants: Participant[];
  projectParticipants?: ProjectParticipant[];
  notionUrl: string;
}
