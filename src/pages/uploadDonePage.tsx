import { useEffect } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router";

export function UploadDonePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
        <Check size={28} className="text-green-500" strokeWidth={2.5} />
      </div>
      <p className="text-[22px] font-semibold text-foreground/80">업로드 완료</p>
      <p className="text-sm font-light text-muted-foreground">
        홈으로 돌아갑니다...
      </p>
    </div>
  );
}
