import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { signup } from "../../apis/authApi";
import { INITIAL_SIGNUP_FORM_VALUES } from "../context/context";
import { useAuthStore } from "../../stores/authStore";
import type { SignupFormValues } from "../../types/authTypes";

type TextFieldName = Exclude<keyof SignupFormValues, "userProfileImage">;

export function SignupInfoModal() {
  const navigate = useNavigate();
  const { accessToken, closeSignupModal, isSignupModalOpen } = useAuthStore();
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
    if (!accessToken) {
      alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      navigate("/login", { replace: true });
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(values, accessToken);
      closeSignupModal();
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

  if (!isSignupModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-foreground">추가 회원정보 입력</h2>
        <p className="mt-2 text-sm text-muted-foreground">서비스 이용을 위해 필수 정보를 입력해 주세요.</p>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-foreground">회사
            <input required value={values.companyId} onChange={handleChange("companyId")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">유저 직급
            <input required value={values.userPosition} onChange={handleChange("userPosition")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">유저 부서
            <input required value={values.userDepartment} onChange={handleChange("userDepartment")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">유저 번호
            <input required value={values.userEmployeeNumber} onChange={handleChange("userEmployeeNumber")} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-foreground">유저 프로필 사진 <span className="text-muted-foreground">(선택)</span>
            <input type="file" accept="image/*" onChange={handleProfileImageChange} className="mt-1.5 block w-full text-sm" />
          </label>
        </div>
        <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "가입 중..." : "회원가입 완료"}
        </button>
      </form>
    </div>
  );
}
