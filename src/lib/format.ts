export function formatMoney(n: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `₹${n.toFixed(2)}`;
  }
}

export function maskAccount(s: string): string {
  if (!s) return "";
  if (s.length <= 4) return s;
  return "•••• " + s.slice(-4);
}