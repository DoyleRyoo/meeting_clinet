import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  getCompany,
  registerCompany,
  updateCompany,
  type CompanyRegistRequest,
  type CompanyUpdateRequest,
} from "../../apis/companyApi";
import type {
  CompanyDto,
  CompanyNotionUrlListItemDto,
  CompanyRelationsResponseDto,
} from "../../apis/apiTypes";
import { useAuthStore } from "../../stores/authStore";

type CompanyManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type CompanyFormValues = {
  companyName: string;
  companyDomain: string;
  companyPhone: string;
  companyNotionWorkspace: string;
};

type NotionRowDraft = {
  notionName: string;
  notionUrl: string;
};

const INITIAL_COMPANY_FORM_VALUES: CompanyFormValues = {
  companyName: "",
  companyDomain: "",
  companyPhone: "",
  companyNotionWorkspace: "",
};

export function CompanyManagementModal({
  isOpen,
  onClose,
}: CompanyManagementModalProps) {
  const oauthUser = useAuthStore((state) => state.oauthUser);
  const userCompanyId = oauthUser?.companyId?.trim() ?? "";
  const [company, setCompany] = useState<CompanyRelationsResponseDto | null>(null);
  const [values, setValues] = useState<CompanyFormValues>(INITIAL_COMPANY_FORM_VALUES);
  const [editingNotionId, setEditingNotionId] = useState<string | null>(null);
  const [notionDraft, setNotionDraft] = useState<NotionRowDraft>({
    notionName: "",
    notionUrl: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const effectiveCompanyId = String(company?.company_id ?? userCompanyId);
  const hasCompany = Boolean(userCompanyId || company?.company_id);
  const notionList = useMemo(
    () => company?.notionList ?? [],
    [company?.notionList],
  );

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsCopied(false);
    setEditingNotionId(null);
    setNotionDraft({ notionName: "", notionUrl: "" });

    if (userCompanyId) {
      void loadCompany();
    } else {
      setCompany(null);
      setValues(INITIAL_COMPANY_FORM_VALUES);
    }
  }, [isOpen, userCompanyId]);

  if (!isOpen) return null;

  const handleChange =
    (field: keyof CompanyFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
    };

  const loadCompany = async () => {
    setIsLoading(true);
    try {
      const response = await getCompany();
      setLoadedCompany(response);
      setErrorMessage(null);
      setSuccessMessage(null);
    } catch (error) {
      setCompany(null);
      setErrorMessage(
        error instanceof Error ? error.message : "회사 정보를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const payload = createCompanyPayload(values);
    if (!payload.company_name) {
      setErrorMessage("회사명을 입력해 주세요.");
      return;
    }

    setIsRegistering(true);
    try {
      const response = await registerCompany<CompanyRelationsResponseDto>(payload);
      setLoadedCompany(response);
      setErrorMessage(null);
      setSuccessMessage("회사가 등록되었습니다.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회사 등록에 실패했습니다.",
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCompanySave = async () => {
    const payload = createCompanyUpdatePayload(values);
    if (!payload.company_name) {
      setErrorMessage("회사명을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateCompany<CompanyDto>(payload);
      setCompany((currentCompany) => ({
        ...currentCompany,
        ...response,
        notionList: currentCompany?.notionList ?? [],
      }));
      setValues(mapCompanyToFormValues(response));
      setErrorMessage(null);
      setSuccessMessage("회사 정보가 저장되었습니다.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회사 정보 저장에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCompanyId = async () => {
    if (!effectiveCompanyId) return;

    try {
      await navigator.clipboard.writeText(effectiveCompanyId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 1600);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "회사 ID를 복사하지 못했습니다.",
      );
    }
  };

  const handleEditNotionRow = (row: CompanyNotionUrlListItemDto) => {
    setEditingNotionId(String(row.notion_id));
    setNotionDraft({
      notionName: row.project_name ?? row.notion_name ?? "",
      notionUrl: row.notion_url ?? "",
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCancelNotionRow = () => {
    setEditingNotionId(null);
    setNotionDraft({ notionName: "", notionUrl: "" });
  };

  const handleSaveNotionRow = () => {
    setErrorMessage(
      "Notion URL 목록 수정 API가 아직 없습니다. 실제 백엔드 엔드포인트가 추가되면 연결해야 합니다.",
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-management-title"
        className="flex h-[680px] w-[920px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="company-management-title" className="text-lg font-semibold">
              회사 관리
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              회사 정보와 Notion URL을 관리합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            닫기
          </button>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}
        {successMessage && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          {!hasCompany ? (
            <section className="space-y-5">
              <div className="rounded-lg border border-border bg-white p-4">
                <p className="text-sm font-semibold text-foreground">
                  연결된 회사 ID가 없습니다.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  회사 정보를 입력해 등록하거나, 현재 계정의 회사 정보를 조회할 수 있습니다.
                </p>
              </div>
              <CompanyFields values={values} onChange={handleChange} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleRegister()}
                  disabled={isRegistering}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRegistering ? "등록 중..." : "회사 등록"}
                </button>
                <button
                  type="button"
                  onClick={() => void loadCompany()}
                  disabled={isLoading}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "조회 중..." : "회사 조회"}
                </button>
              </div>
            </section>
          ) : (
            <section className="space-y-6">
              <div className="grid grid-cols-[1fr_220px] gap-4">
                <CompanyFields values={values} onChange={handleChange} />
                <div>
                  <label className="block text-sm font-medium text-foreground">
                    회사 ID
                    <div className="mt-1.5 flex gap-2">
                      <input
                        readOnly
                        value={effectiveCompanyId}
                        className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void handleCopyCompanyId()}
                        className="shrink-0 rounded-lg border border-border px-3 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
                      >
                        {isCopied ? "복사됨" : "복사"}
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Notion URL 목록
                  </h3>
                  <button
                    type="button"
                    onClick={() => void loadCompany()}
                    disabled={isLoading}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "새로고침 중" : "새로고침"}
                  </button>
                </div>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <div className="grid grid-cols-[1fr_1.5fr_150px] border-b border-border bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
                    <p>프로젝트 이름</p>
                    <p>Notion URL</p>
                    <p className="text-right">작업</p>
                  </div>
                  {notionList.length > 0 ? (
                    notionList.map((row) => {
                      const rowId = String(row.notion_id);
                      const isEditing = editingNotionId === rowId;
                      return (
                        <div
                          key={rowId}
                          className="grid grid-cols-[1fr_1.5fr_150px] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0"
                        >
                          {isEditing ? (
                            <>
                              <input
                                value={notionDraft.notionName}
                                onChange={(event) =>
                                  setNotionDraft((draft) => ({
                                    ...draft,
                                    notionName: event.target.value,
                                  }))
                                }
                                className="h-9 rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
                              />
                              <input
                                value={notionDraft.notionUrl}
                                onChange={(event) =>
                                  setNotionDraft((draft) => ({
                                    ...draft,
                                    notionUrl: event.target.value,
                                  }))
                                }
                                className="h-9 rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={handleCancelNotionRow}
                                  className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:bg-muted"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveNotionRow}
                                  className="rounded-md bg-foreground px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-foreground/80"
                                >
                                  저장
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="truncate text-sm text-foreground">
                                {row.project_name ?? row.notion_name ?? "-"}
                              </p>
                              <p className="truncate text-sm text-muted-foreground">
                                {row.notion_url ?? "-"}
                              </p>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleEditNotionRow(row)}
                                  className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:bg-muted"
                                >
                                  편집
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-3 py-5 text-sm text-muted-foreground">
                      등록된 Notion URL이 없습니다.
                    </p>
                  )}
                </div>
              </section>
            </section>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleCompanySave()}
            disabled={!hasCompany || isSaving}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );

  function setLoadedCompany(response: CompanyRelationsResponseDto) {
    setCompany(response);
    setValues(mapCompanyToFormValues(response));
  }
}

function CompanyFields({
  values,
  onChange,
}: {
  values: CompanyFormValues;
  onChange: (
    field: keyof CompanyFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <label className="block text-sm font-medium text-foreground">
        회사명
        <input
          required
          value={values.companyName}
          onChange={onChange("companyName")}
          className="mt-1.5 h-10 w-full rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        회사 도메인
        <input
          value={values.companyDomain}
          onChange={onChange("companyDomain")}
          className="mt-1.5 h-10 w-full rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        회사 전화번호
        <input
          value={values.companyPhone}
          onChange={onChange("companyPhone")}
          className="mt-1.5 h-10 w-full rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
      <label className="block text-sm font-medium text-foreground">
        Notion 워크스페이스
        <input
          value={values.companyNotionWorkspace}
          onChange={onChange("companyNotionWorkspace")}
          className="mt-1.5 h-10 w-full rounded-lg border border-border px-3 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>
    </div>
  );
}

function mapCompanyToFormValues(company: CompanyDto): CompanyFormValues {
  return {
    companyName: company.company_name ?? "",
    companyDomain: company.company_domain ?? "",
    companyPhone: company.company_phone ?? "",
    companyNotionWorkspace: company.company_notion_workspace ?? "",
  };
}

function createCompanyPayload(values: CompanyFormValues): CompanyRegistRequest {
  return {
    company_name: values.companyName.trim(),
    company_domain: normalizeOptionalString(values.companyDomain),
    company_phone: normalizeOptionalString(values.companyPhone),
    company_notion_workspace: normalizeOptionalString(values.companyNotionWorkspace),
  };
}

function createCompanyUpdatePayload(values: CompanyFormValues): CompanyUpdateRequest {
  return createCompanyPayload(values);
}

function normalizeOptionalString(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}
