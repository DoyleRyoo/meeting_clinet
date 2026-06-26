import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { signup } from "../apis/authApi";
import {
  disconnectNotionWorkspace,
  getNotionConnectionStatus,
  type NotionConnectionStatusResponse,
} from "../apis/notionApi";
import { useAuthStore } from "../stores/authStore";
import type { SignupFormValues } from "../types/authTypes";

type TextFieldName = Exclude<keyof SignupFormValues, "userProfileImage">;

const INITIAL_SIGNUP_FORM_VALUES: SignupFormValues = {
  companyId: "",
  userPosition: "",
  userDepartment: "",
  userEmployeeNumber: "",
  userProfileImage: null,
};

export function UserInfoInputPage() {
  const navigate = useNavigate();
  const { setOAuthUser } = useAuthStore();
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const [values, setValues] = useState<SignupFormValues>(INITIAL_SIGNUP_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connection, setConnection] = useState<NotionConnectionStatusResponse | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(true);

  useEffect(() => {
    if (!oauthUser) {
      navigate("/login", { replace: true });
      return;
    }

    let ignore = false;
    async function loadConnection() {
      try {
        const response = await getNotionConnectionStatus();
        if (ignore) return;
        setConnection(response);
        setConnectionError(null);
      } catch (error) {
        if (ignore) return;
        setConnection(null);
        setConnectionError(error instanceof Error ? error.message : "Notion 연결 상태를 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsLoadingConnection(false);
      }
    }

    void loadConnection();
    return () => {
      ignore = true;
    };
  }, [navigate, oauthUser]);

  if (!oauthUser) return null;

  const handleChange =
    (field: TextFieldName) => (event: ChangeEvent<HTMLInputElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
    };

  const handleProfileImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValues((currentValues) => ({
      ...currentValues,
      userProfileImage: event.target.files?.[0] ?? null,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !values.companyId.trim() ||
      !values.userPosition.trim() ||
      !values.userDepartment.trim() ||
      !values.userEmployeeNumber.trim()
    ) {
      alert("필수 정보를 모두 입력해 주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("email", oauthUser.email);
    formData.append("name", oauthUser.name);
    formData.append("company_id", values.companyId.trim());
    formData.append("user_role", values.userPosition.trim());
    formData.append("user_department", values.userDepartment.trim());
    formData.append("user_employee_number", values.userEmployeeNumber.trim());
    if (values.userProfileImage) {
      formData.append("user_profile_image", values.userProfileImage);
    }

    setIsSubmitting(true);
    try {
      const profileImage = values.userProfileImage
        ? await readFileAsDataUrl(values.userProfileImage)
        : oauthUser.profileImage;
      await signup(formData);
      setOAuthUser({
        ...oauthUser,
        companyId: values.companyId.trim(),
        userPosition: values.userPosition.trim(),
        userDepartment: values.userDepartment.trim(),
        userEmployeeNumber: values.userEmployeeNumber.trim(),
        profileImage,
      });
      navigate("/signup/notion", { replace: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`회원가입에 실패했습니다. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnectNotion = async () => {
    try {
      await disconnectNotionWorkspace();
      setConnection({ notion_connected: false });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Notion 연결을 해제하지 못했습니다.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">추가 정보 입력</h1>
        <div className="mt-4 space-y-1 rounded-lg bg-muted p-4 text-sm">
          <p><span className="text-muted-foreground">이메일: </span>{oauthUser.email}</p>
          <p><span className="text-muted-foreground">이름: </span>{oauthUser.name}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-foreground">회사
            <input required value={values.companyId} onChange={handleChange("companyId")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">직급
            <input required value={values.userPosition} onChange={handleChange("userPosition")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">부서
            <input required value={values.userDepartment} onChange={handleChange("userDepartment")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">사번
            <input required value={values.userEmployeeNumber} onChange={handleChange("userEmployeeNumber")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">프로필 이미지 <span className="text-muted-foreground">(선택)</span>
            <input type="file" accept="image/*" onChange={handleProfileImageChange} className="mt-1.5 block w-full text-sm" />
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "가입 처리 중..." : "가입 완료"}
          </button>
        </form>

        <section className="mt-6 rounded-lg border border-border bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                Notion Workspace
              </h2>
              {isLoadingConnection ? (
                <p className="mt-2 text-sm text-muted-foreground">연결 상태를 확인하는 중입니다.</p>
              ) : connection?.notion_connected ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-green-700">Notion 연결됨</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {connection.notion_workspace_name || "Notion 워크스페이스"}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Notion이 연결되어 있지 않습니다.
                </p>
              )}
              {connectionError && (
                <p className="mt-2 text-sm text-destructive">{connectionError}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {connection?.notion_connected ? (
              <button
                type="button"
                onClick={() => void handleDisconnectNotion()}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
              >
                연결 해제
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate("/signup/notion")}
              className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground/80"
            >
              Notion 연결하기
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("이미지 데이터를 읽지 못했습니다."));
    };
    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}
