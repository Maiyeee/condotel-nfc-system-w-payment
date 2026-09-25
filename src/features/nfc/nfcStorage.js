const CARDS_KEY = "condotel.nfc.cards.phase5";
const SCANS_KEY = "condotel.nfc.scans.phase5";

export function loadNfcCards(fallback = []) {
  try {
    const value = localStorage.getItem(CARDS_KEY);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveNfcCards(cards) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function loadNfcScanLogs(fallback = []) {
  try {
    const value = localStorage.getItem(SCANS_KEY);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveNfcScanLogs(logs) {
  localStorage.setItem(SCANS_KEY, JSON.stringify(logs));
}
