export function LoadingDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-2 w-2 animate-bounce rounded-full bg-foreground/30"
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: "0.8s",
          }}
        />
      ))}
    </div>
  );
}
