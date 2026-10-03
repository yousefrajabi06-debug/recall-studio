const key = "recall-studio.cards.v1";
export function loadCards() {
  try {
    const cards = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(cards) &&
      cards.every(
        (card) =>
          card &&
          ["id", "question", "answer", "deck"].every(
            (field) => typeof card[field] === "string",
          ),
      )
      ? cards
      : [];
  } catch {
    return [];
  }
}
export function saveCards(cards) {
  try {
    localStorage.setItem(key, JSON.stringify(cards));
    return "";
  } catch {
    return "Browser storage is unavailable. Your changes last only for this session.";
  }
}
