export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAmount(amount: number, currency: string): string {
  try {
    return formatCurrency(amount, currency);
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${amount.toFixed(2)}`;
  }
}
