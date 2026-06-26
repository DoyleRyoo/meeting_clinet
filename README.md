# damlok_frontend

Damlok frontend is a React application for managing meeting projects, recording meetings, and editing generated meeting summaries.

- React
- vite
- Tailwindcss@3
- Axios
- Zustand
- React Router Dom
- Docker
- Oauth
- Flutter (가능할 시)

This project contains the frontend application for Damlok. It provides a sidebar-based workspace where users can create projects, manage project participants, start a meeting recording flow, review summary screens, and edit meeting summary content.

The current application uses client-side mock data for project, participant, meeting, summary, and signup flows while backend integration is still being prepared. Implemented backend-facing code is limited to the frontend API client and active auth request functions.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v3
- React Router
- Zustand
- Axios
- Lucide React
- ESLint
- Prettier

Notes:

- `@supabase/supabase-js`, `dayjs`, `react-hot-toast`, and `react-media-recorder` are listed in dependencies but are not currently imported by the source code.
- Audio recording uses the browser `MediaRecorder`, `MediaStream`, and Web Audio APIs directly.

## Features

- Authentication UI
  - Login page with Google login button.
  - OAuth callback placeholder.
  - Signup/additional user information form.
  - Profile menu, logout action, and profile edit modal.
  - In Progress: Google OAuth and signup backend integration are not fully connected in the active UI.
- Project workspace
  - Sidebar layout with project list.
  - Project creation form.
  - Project detail page with project metadata, status badge, meeting list, and meeting start action.
  - Project settings form for title, description, participants, and Notion URL.
  - Project status changes for active, completed, and archived states.
  - In Progress: project data is currently stored with mock data and browser state/localStorage.
- Participant management
  - Participant management modal.
  - Email-based mock user search.
  - Add, remove, and update participant status in the frontend.
  - In Progress: participant API calls are represented by commented integration placeholders.
- Recording UI
  - Browser microphone permission handling.
  - Start, pause, resume, cancel, and complete recording controls.
  - Elapsed time display.
  - Live waveform visualization using Web Audio APIs.
  - In Progress: recorded audio upload is not connected; summary generation starts from a mock transcript.
- Summary flow
  - Summarizing loading screen.
  - Editable summary page with tabs for one-line summary, full summary, and action items.
  - Add/remove full-summary sections and items.
  - Add/edit action items.
  - In Progress: AI summary and meeting summary persistence use mock frontend data.
- Upload flow
  - Uploading loading screen.
  - Upload completion screen.
  - In Progress: Notion upload is represented by timed UI screens only.
- Test screens
  - Text-to-AI test page for manually submitting text into the mock summary flow.
  - OAuth success test route for entering user information.

## Project Structure

```text
frontend/
├─ public/
│
├─ src/
│
├─ eslint.config.ts
├─ tsconfig.json
└─ .env

src/
├─ api/                 # API 호출
│  ├─ authApi.ts
│  ├─ projectApi.ts
│  ├─ participantApi.ts
│  ├─ aiApi.ts
│  └─ axios.ts
│
├─ components/          # 재사용 컴포넌트
│  ├─ layout/
│  │  ├─ AppLayout.tsx
│  │  ├─ Sidebar.tsx
│  │  └─ UserProfile.tsx
│  │
│  ├─ common/
│  │  ├─ Button.tsx
│  │  ├─ Modal.tsx
│  │  ├─ Loading.tsx
│  │  └─ EmptyState.tsx
│  │
│  └─ meeting/
│     ├─ MeetingSummary.tsx
│     ├─ ActionItemList.tsx
│     └─ RecordingControl.tsx
│
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ ProjectPage.tsx
│  ├─ ProjectDetailPage.tsx
│  ├─ MeetingCreatePage.tsx
│  └─ MeetingDetailPage.tsx
│
├─ routes/
│  └─ Router.tsx
│
├─ store/               # Context API
│  ├─ AuthContext.tsx
│  └─ ProjectContext.tsx
│
├─ hooks/
│  ├─ useAuth.ts
│  └─ useRecording.ts
│
├─ utils/
│  ├─ constants.ts
│  └─ formatters.ts
│
├─ App.tsx
└─ main.tsx
```

Root configuration files include Vite, TypeScript, ESLint, PostCSS, Tailwind CSS, and Docker configuration.

## Routing

Routes are configured in `src/routes/router.tsx` with `createBrowserRouter`.

| Path | Page | Purpose |
| --- | --- | --- |
| `/login` | `LoginPage` | Login UI |
| `/auth/callback` | `AuthCallbackPage` | OAuth callback placeholder |
| `/user-info` | `UserInfoInputPage` | OAuth/signup test information form |
| `/` | `RootPageLayout` + `HomePage` | Main workspace shell and home action |
| `/projects/create` | `NewProjectPage` | Create a new project |
| `/projects/:pid` | `ProjectDetailPage` | View project details and meetings |
| `/projects/:pid/update` | `ProjectSettingsPage` | Edit project settings |
| `/projects/:pid/record` | `RecordingPage` | Meeting recording UI |
| `/projects/:pid/record/summarizing` | `SummarizingPage` | Summary loading state |
| `/projects/:pid/record/summary` | `SummaryPage` | Editable meeting summaries |
| `/projects/:pid/record/uploading` | `UploadingPage` | Upload loading state |
| `/projects/:pid/record/done` | `UploadDonePage` | Upload completion state |
| `/projects/:pid/text-to-ai` | `TextToAiPage` | Text summary test route |

## State Management

State is managed with React state, React context, browser storage, and Zustand.

- `src/components/context/context.tsx`
  - Provides `AppProvider` and `useApp`.
  - Stores projects, tasks, selected summary tab, recording elapsed time, and the recording timer ref.
  - Uses mock project, participant, meeting, summary, and task data.
  - Persists authenticated users' projects to `localStorage` with a `projects:{email}` key.
  - Uses in-memory project state for unauthenticated sessions.
- `src/stores/authStore.ts`
  - Zustand store for auth status, access token, OAuth user profile, signup modal state, and logout.
  - Persists `accessToken` and `oauthUser` in `localStorage`.
- `src/store/summaryStore.ts`
  - Zustand store for mock AI summary status, summary data, and errors.
  - Simulates async summary generation with a delay.

## API Integration

The frontend API layer is located in `src/apis/authApi.ts`.

- Axios is configured with `baseURL: import.meta.env.VITE_API_BASE_URL`.
- Active functions:
  - `login()` posts to `/auth/login`.
  - `logout(accessToken?)` posts to `/auth/logout` and optionally sends a bearer token.
  - `signup(...)` currently simulates a successful signup after a delay.
- Several backend integration points are present as commented placeholders in the auth, project, participant, recording, and summary flows.

The README intentionally does not document backend endpoint behavior. It only describes how the frontend is currently prepared to communicate with backend services.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

The project also defines `build`, `preview`, and `lint` scripts in `package.json`, but they do not currently complete successfully because of existing TypeScript and ESLint issues in the source code.

## Environment Variables

No `.env.example` file is currently provided.

The source code references the following frontend environment variable:

```bash
VITE_API_BASE_URL=
```

`VITE_API_BASE_URL` is used by the Axios auth client in `src/apis/authApi.ts`. Do not commit secret values to the repository.

## Development Rules

Conventions inferred from the codebase:

- Use TypeScript for application source.
- Use React function components and hooks.
- Use Tailwind CSS utility classes for styling.
- Keep route-level views in `src/pages`.
- Keep reusable UI in `src/components`, grouped by feature area.
- Use camelCase for variables, functions, and most filenames.
- Use Zustand for shared auth and summary state.
- Use React context for app-wide project, task, summary tab, and recording timer state.
- Keep backend-pending flows clearly separated from active mock logic.

## Current Status

Implemented:

- Vite + React + TypeScript application shell.
- Root layout with sidebar navigation.
- Login, signup information, profile, and logout UI.
- Project creation, detail, settings, status update, and participant management UI.
- Browser-based recording controls and waveform visualization.
- Mock AI summarizing flow.
- Editable summary UI for short summary, full summary, and action items.
- Uploading and upload-done UI states.
- Client-side state persistence for authenticated project data and auth data.

In Progress:

- Google OAuth integration.
- Signup/profile backend persistence.
- Project and participant backend integration.
- Recording file upload.
- Real AI summary generation.
- Real meeting summary persistence.
- Notion upload integration.
- Production build and lint cleanup. Current checks fail on existing unused recording helpers and ESLint rules in the app context and participant modal.

## Screenshots

Screenshot assets are not currently included in the repository.

<!-- Add screenshots here when image assets are available. -->

## License

This project is licensed under the MIT License. See `LICENSE` for details.
