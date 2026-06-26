import type { ReactNode } from "react";

interface SummarySectionProps {
  title: string;
  dot: string;
  children: ReactNode;
}

export function SummarySection({ title, dot, children }: SummarySectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dot }}
        />
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      </div>
      <div className="pl-5">{children}</div>
    </section>
  );
}
