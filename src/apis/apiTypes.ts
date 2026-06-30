export const projectStatus = {
  active: "ACTIVE",
  completed: "COMPLETED",
  archived: "ARCHIVED",
} as const;
export type ProjectStatus = (typeof projectStatus)[keyof typeof projectStatus];

export const projectParticipantStatus = {
  active: "ACTIVE",
  left: "LEFT",
  removed: "REMOVED",
} as const;
export type ProjectParticipantStatus =
  (typeof projectParticipantStatus)[keyof typeof projectParticipantStatus];

export type MeetingStatus = "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
export type ActionItemPriority = "HIGH" | "MEDIUM" | "LOW";
export type ActionItemStatus = "미착수" | "진행중" | "완료";

export interface CompanyDto {
  company_id: string | number;
  company_name: string;
  company_domain: string | null;
  company_phone: string | null;
  company_created_at: string;
  company_updated_at: string | null;
  company_notion_workspace: string | null;
}

export interface UserDto {
  user_id: string | number;
  company_id: string | number;
  user_email: string;
  user_name: string;
  user_profile_image: string | null;
  user_last_login: string | null;
  user_phone: string | null;
  user_department: string;
  user_role: string;
  user_status: boolean;
  user_created_at: string;
  user_updated_at: string | null;
}

export interface ProjectDto {
  project_id: string | number;
  company_id: string | number;
  project_title: string;
  project_description: string | null;
  project_status: ProjectStatus;
  project_created_at: string;
  project_updated_at: string | null;
}

export interface ProjectParticipantDto {
  project_member_id: string | number;
  project_id: string | number;
  user_id: string | number;
  project_member_role: string;
  project_member_created_at: string;
  project_member_updated_at: string | null;
  project_status: ProjectParticipantStatus;
  project_member_grade: string;
}

export interface MeetingDto {
  meeting_id: string | number;
  project_id: string | number;
  meeting_title: string;
  meeting_date: string;
  meeting_audio_url: string | null;
  duration_sec: number | null;
  meeting_status: MeetingStatus;
  meeting_started_at: string | null;
  meeting_ended_at: string | null;
  meeting_transcript: string | null;
  meeting_cleaned_transcript: string | null;
  meeting_short_summary: string | null;
  meeting_embedding: unknown | null;
  meeting_created_at: string;
  meeting_updated_at: string | null;
}

export interface MeetingParticipantDto {
  meeting_participant_id: string | number;
  meeting_id: string | number;
  project_member_id: string | number;
  meeting_participant_created_at: string;
}

export interface FullSummaryDto {
  summary_id: string | number;
  meeting_id: string | number;
  summary_objective: string;
  summary_decision: string;
  summary_notion_page_id: string | null;
  summary_notion_page_url: string | null;
  summary_created_at: string;
}

export interface ActionItemDto {
  action_item_id: string | number;
  meeting_id: string | number;
  project_member_id: string | number;
  assignee_name: string | null;
  assignee_email: string | null;
  action_item_task: string;
  action_item_start_date: string;
  action_item_due_date: string;
  action_item_priority: ActionItemPriority;
  action_item_status: ActionItemStatus;
  action_item_notion_page_id: string | null;
  action_item_notion_page_url: string | null;
  action_item_created_at: string;
  action_item_updated_at: string | null;
}

export interface NotionDto {
  notion_id: string | number;
  notion_name: string | null;
  notion_url: string | null;
  company_id: string | number;
}

export interface CompanyNotionUrlListItemDto extends NotionDto {
  project_name?: string | null;
}

export interface CompanyRelationsResponseDto extends CompanyDto {
  users?: UserDto[];
  projects?: ProjectDto[];
  notionList?: CompanyNotionUrlListItemDto[];
}

export interface UserDetailResponseDto extends UserDto {
  projectParticipants?: ProjectParticipantDto[];
}

export interface ProjectParticipantWithUserDto extends ProjectParticipantDto {
  user: UserDto;
}

export interface ProjectDetailResponseDto extends ProjectDto {
  project_description: string | null;
  participants?: ProjectParticipantWithUserDto[];
  meetings?: MeetingDto[];
}

export interface MeetingDetailResponseDto extends MeetingDto {
  meetingParticipants?: MeetingParticipantDto[];
  fullSummary?: FullSummaryDto | null;
  actionItems?: ActionItemDto[];
}

export type Company = CompanyDto;
export type User = UserDto;
export type Project = ProjectDto;
export type ProjectParticipant = ProjectParticipantDto;
export type Meeting = MeetingDto;
export type MeetingParticipant = MeetingParticipantDto;
export type FullSummary = FullSummaryDto;
export type Notion = NotionDto;

export interface ParticipantView {
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

export interface MeetingView {
  id: string;
  title: string;
  date: string;
  nth: string;
}

export type Participant = ParticipantView;

export interface ProjectParticipantView extends ParticipantView {
  projectMemberId: string;
  projectId: string;
  userId: string;
  projectMemberRole: string;
  projectMemberCreatedAt: string;
  projectMemberUpdatedAt: string;
  projectMemberStatus: ProjectParticipantStatus;
  projectMemberGrade: string;
}

export interface ProjectParticipantUserView {
  userId: string;
  name: string;
  email: string;
  department: string;
  grade: string;
  position: string;
  profileImage: string | null;
  status: string;
}

export interface ProjectDetailParticipant extends ProjectParticipantView {
  user: ProjectParticipantUserView;
}

export interface ProjectDetailResponse {
  projectId: string;
  companyId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string | null;
  participants: ProjectDetailParticipant[];
  projectParticipants?: ProjectParticipantView[];
  meetings?: MeetingView[];
}

export interface ProjectView {
  id: string;
  projectId?: string;
  companyId?: string;
  title: string;
  projectDescription?: string;
  projectStatus?: ProjectStatus;
  projectCreatedAt?: string;
  projectUpdatedAt?: string;
  meetings: MeetingView[];
  participants: ParticipantView[];
  projectParticipants?: ProjectParticipantView[];
  notionUrl: string;
}

export interface FullSummarySection {
  contextTitle: string;
  context: string[];
}

export interface ActionItem {
  actionItemId?: string;
  meetingId: string;
  projectMemberId?: string;
  assigneeName: string;
  assigneeEmail: string;
  task: string;
  startDate: string;
  dueDate: string;
  priority: ActionItemPriority;
  status: ActionItemStatus;
}
