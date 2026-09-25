const TRANSACTIONS_KEY = "condotel.transactions.phase4";

export function loadTransactions(fallback) {
  try {
    const stored = window.localStorage.getItem(TRANSACTIONS_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function saveTransactions(transactions) {
  try {
    window.localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(transactions),
    );
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}
