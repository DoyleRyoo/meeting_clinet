import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 items-center justify-center">
      <button
        onClick={() => navigate("/projects/create")}
        className="flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-foreground/80 active:scale-95"
      >
        <Plus size={16} />새 프로젝트 시작하기  
      </button>
    </div>
  );
}
