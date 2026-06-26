import { useEffect, useMemo, useRef } from "react";

const BAR_COUNT = 48;
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 72;
const IDLE_BAR_HEIGHTS = Array.from(
  { length: BAR_COUNT },
  (_, index) => 8 + Math.sin(index * 0.5) * 6,
);

type WaveformProps = {
  active: boolean;
  stream: MediaStream | null;
};

export function Waveform({ active, stream }: WaveformProps) {
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, index) => index), []);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const animationRef = useRef<number>(0);
  const heightsRef = useRef<number[]>([...IDLE_BAR_HEIGHTS]);

  useEffect(() => {
    const resetBars = () => {
      heightsRef.current = [...IDLE_BAR_HEIGHTS];
      barRefs.current.forEach((bar, index) => {
        if (!bar) return;
        const height = IDLE_BAR_HEIGHTS[index];
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = "#CCCCCC";
        bar.style.opacity = "0.5";
      });
    };

    if (!active || !stream) {
      resetBars();
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.82;

    const frequencyData = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);

    const animate = () => {
      analyser.getByteFrequencyData(frequencyData);

      const usableBinCount = Math.floor(frequencyData.length * 0.65);
      const binsPerBar = Math.max(1, Math.floor(usableBinCount / BAR_COUNT));

      for (let index = 0; index < BAR_COUNT; index += 1) {
        const startBin = index * binsPerBar;
        const endBin =
          index === BAR_COUNT - 1
            ? usableBinCount
            : Math.min(usableBinCount, startBin + binsPerBar);
        let sum = 0;

        for (let bin = startBin; bin < endBin; bin += 1) {
          sum += frequencyData[bin];
        }

        const average = sum / Math.max(1, endBin - startBin);
        const normalized = Math.min(1, Math.max(0, (average - 8) / 120));
        const eased = Math.pow(normalized, 0.75);
        const targetHeight =
          MIN_BAR_HEIGHT + eased * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);
        const previousHeight = heightsRef.current[index] ?? MIN_BAR_HEIGHT;
        const nextHeight = previousHeight + (targetHeight - previousHeight) * 0.35;
        heightsRef.current[index] = nextHeight;

        const bar = barRefs.current[index];
        if (!bar) continue;
        bar.style.height = `${Math.round(nextHeight)}px`;
        bar.style.backgroundColor = "#111111";
        bar.style.opacity = `${0.75 + (nextHeight / MAX_BAR_HEIGHT) * 0.25}`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    void audioContext.resume();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
    };
  }, [active, stream]);

  return (
    <div className="flex h-28 items-center justify-center gap-[3px]">
      {bars.map((index) => (
        <div
          key={index}
          ref={(bar) => {
            barRefs.current[index] = bar;
          }}
          className="w-[5px] rounded-full transition-none"
          style={{
            height: `${IDLE_BAR_HEIGHTS[index]}px`,
            backgroundColor: active ? "#111111" : "#CCCCCC",
            opacity: active
              ? 0.75 + (IDLE_BAR_HEIGHTS[index] / MAX_BAR_HEIGHT) * 0.25
              : 0.5,
          }}
        />
      ))}
    </div>
  );
}
