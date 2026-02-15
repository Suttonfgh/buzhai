const RISK_TERMS = ["stupid", "idiot", "always", "never"];

export function runQuickCheck(text: string): number {
  const normalized = text.toLowerCase();
  if (!normalized.trim()) {
    return 0;
  }

  let hits = 0;
  for (const term of RISK_TERMS) {
    if (normalized.includes(term)) {
      hits += 1;
    }
  }

  return Math.min(100, hits * 25);
}
