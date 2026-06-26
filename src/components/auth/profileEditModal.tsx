import { type ChangeEvent, type FormEvent, useState } from "react";
import { useAuthStore } from "../../stores/authStore";

type ProfileEditModalProps = {
  onClose: () => void;
};

type ProfileFormValues = {
  name: string;
  companyId: string;
  userPosition: string;
  userDepartment: string;
  userEmployeeNumber: string;
};

export function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const setOAuthUser = useAuthStore((state) => state.setOAuthUser);
  const [values, setValues] = useState<ProfileFormValues>({
    name: oauthUser?.name ?? "",
    companyId: oauthUser?.companyId ?? "",
    userPosition: oauthUser?.userPosition ?? "",
    userDepartment: oauthUser?.userDepartment ?? "",
    userEmployeeNumber: oauthUser?.userEmployeeNumber ?? "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(
    oauthUser?.profileImage ?? null,
  );

  if (!oauthUser) return null;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  };

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProfileImage(await readFileAsDataUrl(file));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`프로필 이미지를 불러오지 못했습니다. ${message}`);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !values.name.trim() ||
      !values.companyId.trim() ||
      !values.userPosition.trim() ||
      !values.userDepartment.trim() ||
      !values.userEmployeeNumber.trim()
    ) {
      alert("필수 정보를 모두 입력해 주세요.");
      return;
    }

    setOAuthUser({
      ...oauthUser,
      ...values,
      name: values.name.trim(),
      companyId: values.companyId.trim(),
      userPosition: values.userPosition.trim(),
      userDepartment: values.userDepartment.trim(),
      userEmployeeNumber: values.userEmployeeNumber.trim(),
      profileImage,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-foreground">프로필 수정</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-foreground">이메일
            <input
              disabled
              value={oauthUser.email}
              className="mt-1.5 w-full rounded-lg border border-border bg-muted px-3 py-2 text-muted-foreground"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">이름
            <input
              required
              name="name"
              value={values.name}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">회사
            <input
              required
              name="companyId"
              value={values.companyId}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">직급
            <input
              required
              name="userPosition"
              value={values.userPosition}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">부서
            <input
              required
              name="userDepartment"
              value={values.userDepartment}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">사번
            <input
              required
              name="userEmployeeNumber"
              value={values.userEmployeeNumber}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-border px-3 py-2"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">프로필 이미지 <span className="text-muted-foreground">(선택)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="mt-1.5 block w-full text-sm"
            />
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-white"
          >
            저장
          </button>
        </div>
      </form>
    </div>
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
