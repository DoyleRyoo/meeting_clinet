import { createBrowserRouter } from "react-router";
import { RootPageLayout } from "../layouts/rootPageLayout";
import {
  AuthCallbackPage,
  HomePage,
  LoginPage,
  NewProjectPage,
  ProjectDetailPage,
  ProjectSettingsPage,
  RecordingPage,
  SummarizingPage,
  SummaryPage,
  UploadDonePage,
  UploadingPage,

  // 테스트용 파라미터
  TextToAiPage,
  UserInfoInputPage,
} from "../pages";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  { path: "/auth/callback", Component: AuthCallbackPage },

  // 회원가입 테스트용 경로
  { path: "user-info", Component: UserInfoInputPage },
  {
    path: "/",
    Component: RootPageLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "projects/create", Component: NewProjectPage },
      { path: "projects/:pid", Component: ProjectDetailPage },
      { path: "projects/:pid/update", Component: ProjectSettingsPage },
      { path: "projects/:pid/record", Component: RecordingPage },
      { path: "projects/:pid/record/summarizing", Component: SummarizingPage },
      { path: "projects/:pid/record/summary", Component: SummaryPage },
      { path: "projects/:pid/record/uploading", Component: UploadingPage },
      { path: "projects/:pid/record/done", Component: UploadDonePage },

      // 테스트 페이지 경로
      { path: "projects/:pid/text-to-ai", Component: TextToAiPage },
    ],
  },
]);
