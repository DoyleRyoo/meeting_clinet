import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, X } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  createMockMeetingTranscript,
  useApp,
} from "../components/context/context";
import { formatElapsed, getNowStrings } from "../utils/dateTime";
import { Waveform } from "../components/recording/waveform";
import { useSummaryStore } from "../store/summaryStore";

type RecordingStatus = "ready" | "recording" | "paused";

const supportedAudioMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

export function RecordingPage() {
  const navigate = useNavigate();
  const { pid } = useParams<{ pid: string }>();
  const { elapsed, setElapsed, timerRef } = useApp();
  const startSummary = useSummaryStore((state) => state.startSummary);
  const [status, setStatus] = useState<RecordingStatus>("ready");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { dateString, timeString } = getNowStrings();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [timerRef]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((previousElapsed) => previousElapsed + 1);
    }, 1000);
  };

  const handleStart = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      alert("이 브라우저에서는 마이크 녹음을 지원하지 않습니다.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onerror = () => {
        alert("녹음 중 오류가 발생했습니다.");
        if (timerRef.current) clearInterval(timerRef.current);
        stopMediaStream();
        setStatus("ready");
      };
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      mediaStreamRef.current = stream;
      setElapsed(0);
      setStatus("recording");
      startTimer();
    } catch (error: unknown) {
      const message = getMicrophoneErrorMessage(error);
      alert(message);
      stopMediaStream();
      setStatus("ready");
    }
  };

  const handlePause = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state !== "recording") return;

    mediaRecorder.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus("paused");
  };

  const handleResume = () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state !== "paused") return;

    mediaRecorder.resume();
    setStatus("recording");
    startTimer();
  };

  const handleStopAndSave = async () => {
    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state === "inactive") return;

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const audioBlob = await stopRecording(mediaRecorder, audioChunksRef.current);
      const fileName = createRecordingFileName(audioBlob.type);

      // 테스트 단계에서만 사용하는 코드입니다. 추후 삭제가 필요합니다.
      // MediaRecorder의 실제 인코딩 형식에 맞춰 브라우저 다운로드를 실행합니다.
      downloadRecording(audioBlob, fileName);

      // 실제 프로그램에서 사용하는 코드입니다.
      // 백엔드 녹음 파일 업로드 API 연동 완료 후 주석을 해제하여 사용합니다.
      // const formData = new FormData();
      // formData.append("file", audioBlob, fileName);
      // await recordingApi.uploadRecording(formData);

      startSummary(createMockMeetingTranscript(elapsed));
      navigate(`/projects/${pid}/record/summarizing`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      alert(`녹음 저장에 실패했습니다. ${message}`);
      setStatus("ready");
    } finally {
      stopMediaStream();
      mediaRecorderRef.current = null;
    }
  };

  const handleCancel = () => {
    if (!window.confirm("현재까지 진행된 녹음이 모두 삭제됩니다. 정말 취소하시겠습니까?")) {
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    stopMediaStream();
    setElapsed(0);
    setStatus("ready");
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex items-center justify-center border-b border-border px-10 py-5">
        <div className="flex items-center gap-2">
          {status === "recording" && (
            <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          )}
          {status === "paused" && (
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          )}
          <p className="text-sm font-light text-foreground/70">
            {dateString} {timeString}
            {status === "paused" && " - 일시정지됨"}
          </p>
        </div>

        {status !== "ready" && (
          <span
            className={`absolute right-10 text-sm font-light tabular-nums ${
              status === "recording" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-10">
        <Waveform active={status === "recording"} />

        <div className="flex items-center gap-8">
          <button
            onClick={handleCancel}
            disabled={status !== "paused"}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border text-foreground/50 transition-all hover:border-foreground/40 hover:text-foreground/70 disabled:cursor-not-allowed disabled:opacity-20"
            aria-label="녹음 취소"
          >
            <X size={18} />
          </button>

          {status === "ready" && (
            <button
              onClick={handleStart}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg shadow-destructive/30 transition-all hover:scale-105 active:scale-95"
              aria-label="녹음 시작"
            >
              <Play size={22} className="ml-1" />
            </button>
          )}

          {status === "recording" && (
            <button
              onClick={handlePause}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg shadow-destructive/30 transition-all hover:scale-105 active:scale-95"
              aria-label="녹음 일시정지"
            >
              <Pause size={22} />
            </button>
          )}

          {status === "paused" && (
            <button
              onClick={handleResume}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-white shadow-lg shadow-destructive/30 transition-all hover:scale-105 active:scale-95"
              aria-label="녹음 재개"
            >
              <Play size={22} className="ml-1" />
            </button>
          )}

          <button
            onClick={handleStopAndSave}
            disabled={status === "ready"}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-white transition-all hover:bg-foreground/80 active:scale-95 disabled:cursor-not-allowed disabled:bg-foreground/10 disabled:text-foreground/20"
            aria-label="녹음 완료 및 저장"
          >
            <Square size={16} fill={status === "ready" ? "none" : "white"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getSupportedAudioMimeType(): string | undefined {
  return supportedAudioMimeTypes.find((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType),
  );
}

function stopRecording(
  mediaRecorder: MediaRecorder,
  audioChunks: Blob[],
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || "audio/webm";
      resolve(new Blob(audioChunks, { type: mimeType }));
    };
    mediaRecorder.onerror = () => reject(new Error("녹음을 중지하지 못했습니다."));
    mediaRecorder.stop();
  });
}

function createRecordingFileName(mimeType: string): string {
  const extension = mimeType.includes("mp4") ? "m4a" : "webm";
  return `meeting-record-${Date.now()}.${extension}`;
}

function downloadRecording(audioBlob: Blob, fileName: string): void {
  const downloadUrl = URL.createObjectURL(audioBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
}

function getMicrophoneErrorMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해 주세요.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "사용 가능한 마이크를 찾을 수 없습니다.";
  }
  return "마이크를 시작하지 못했습니다. HTTPS 또는 localhost 환경에서 다시 시도해 주세요.";
}
