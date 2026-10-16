export interface TimeParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

export function getTimeParts(targetIsoOrDate: string | Date, nowMs: number = Date.now()): TimeParts {
  const targetMs = typeof targetIsoOrDate === 'string' ? new Date(targetIsoOrDate).getTime() : targetIsoOrDate.getTime();
  const diffMs = Math.max(0, nowMs - targetMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

export function getApproxMonths(dateIso: string, nowMs: number = Date.now()): { years: number; months: number } {
  const targetMs = new Date(dateIso).getTime();
  const diffMs = Math.max(0, nowMs - targetMs);
  const totalMonths = Math.floor(diffMs / 2629800000); // 30.4375 days average
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
}
