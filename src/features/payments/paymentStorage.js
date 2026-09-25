const PAYMENTS_KEY = "condotel.payments.phase4";
const RESERVATIONS_KEY = "condotel.payment-reservations.phase4";

export function loadPayments(fallback) {
  try {
    const stored = window.localStorage.getItem(PAYMENTS_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function savePayments(payments) {
  try {
    window.localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}

export function loadPaymentReservations(fallback) {
  try {
    const stored = window.localStorage.getItem(RESERVATIONS_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function savePaymentReservations(reservations) {
  try {
    window.localStorage.setItem(
      RESERVATIONS_KEY,
      JSON.stringify(reservations),
    );
  } catch {
    // Storage may be unavailable in restricted/private browser contexts.
  }
}
