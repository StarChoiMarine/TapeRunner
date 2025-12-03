const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

export function toKSTDate(isoOrMs: string | number | Date): Date {
  const d = isoOrMs instanceof Date ? isoOrMs : new Date(isoOrMs as any);
  return new Date(d.getTime() + KST_OFFSET_MS);
}

export function getKSTParts(iso: string | number | Date) {
  const k = toKSTDate(iso);
  // UTC getters on shifted date == KST 실제 시각 구성요소
  const y = k.getUTCFullYear();
  const m = k.getUTCMonth() + 1; // 1~12
  const d = k.getUTCDate();
  const hh = k.getUTCHours();
  const mm = k.getUTCMinutes();
  const ss = k.getUTCSeconds();
  return { y, m, d, hh, mm, ss };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatKSTDate(iso: string | number | Date): string {
  const { y, m, d } = getKSTParts(iso);
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function formatKSTTime(iso: string | number | Date): string {
  const { hh, mm } = getKSTParts(iso);
  return `${pad(hh)}:${pad(mm)}`;
}

export function getKSTYearMonth(iso: string | number | Date): { year: number; month: number } {
  const { y, m } = getKSTParts(iso);
  return { year: y, month: m };
}


