import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { signup } from "../apis/authApi";
import {
  INITIAL_SIGNUP_FORM_VALUES,
  MOCK_OAUTH_USER,
} from "../components/context/context";
import { useAuthStore } from "../stores/authStore";
import type { SignupFormValues } from "../types/authTypes";

type TextFieldName = Exclude<keyof SignupFormValues, "userProfileImage">;

export function UserInfoInputPage() {
  const navigate = useNavigate();
  const { setAccessToken, setOAuthUser } = useAuthStore();
  const oauthUser = useAuthStore((state) => state.oauthUser) ?? MOCK_OAUTH_USER;
  const [values, setValues] = useState<SignupFormValues>(INITIAL_SIGNUP_FORM_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    formData.append("companyId", values.companyId.trim());
    formData.append("userPosition", values.userPosition.trim());
    formData.append("userDepartment", values.userDepartment.trim());
    formData.append("userEmployeeNumber", values.userEmployeeNumber.trim());
    if (values.userProfileImage) {
      formData.append("userProfileImage", values.userProfileImage);
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
      setAccessToken("mock-access-token");
      navigate("/", { replace: true });
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
      </section>
    </main>
  );
}
