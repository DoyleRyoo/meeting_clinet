export const formatElapsed = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

export function getNowStrings() {
  const now = new Date();

  return {
    dateString: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}.${String(now.getDate()).padStart(2, "0")}`,
    timeString: `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`,
  };
}
