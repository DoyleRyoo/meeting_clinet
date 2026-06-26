import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { LoadingDots } from "../components/common/loadingDots";

export function UploadingPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(`/projects/${pid}/record/done`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, pid]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <LoadingDots />
      <p className="text-[22px] font-semibold text-foreground/80">
        업로드 중...
      </p>
      <p className="text-sm font-light text-muted-foreground">
        Notion에 회의 내용을 업로드하고 있습니다.
      </p>
    </div>
  );
}
