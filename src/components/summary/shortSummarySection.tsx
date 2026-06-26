interface ShortSummarySectionProps {
  shortSummary: string;
  onChange: (value: string) => void;
}

export function ShortSummarySection({
  shortSummary,
  onChange,
}: ShortSummarySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-white p-5">
      <h2 className="text-base font-semibold">
        한 줄 요약
      </h2>

      <textarea
        value={shortSummary}
        maxLength={200}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-3 w-full resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
      />

      <p className="mt-1 text-right text-xs text-muted-foreground">
        {shortSummary.length} / 200
      </p>
    </section>
  );
}
