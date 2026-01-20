export const getFromCdn = (key: string) => {
  const api = import.meta.env.VITE_API_URL;
  return `${api}/i/${key}`;
};


export function formatWhen(createdAt?: string) {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return `${sec}s`;
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;

  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
}