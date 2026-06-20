import { format, parseISO, isToday, isYesterday, differenceInDays } from "date-fns";

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), "MMM d");
}

export function formatDateFull(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM d, yyyy");
}

export function getAgingDays(dateStr: string): number {
  return differenceInDays(new Date(), parseISO(dateStr));
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
