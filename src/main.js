import "./styles.css";
import { loadCards, saveCards } from "./lib/storage";

// This template is static. User content is assigned through textContent/value below.
document.querySelector("#root").innerHTML = `
<div class="app"><header class="site-header"><a class="brand" href="./"><span class="brand-icon">r</span>Recall Studio<span class="brand-dot">.</span></a><span class="header-section">Your learning space</span><a class="source" href="https://github.com/yousefrajabi06-debug/recall-studio">View source ↗</a></header>
<main><section class="heading"><div><p class="eyebrow">SMALL SESSIONS. LASTING CONNECTIONS.</p><h1>Make what you learn stick.</h1><p class="subtitle">Collect a question. Give it some thought. Come back a little stronger.</p></div><button id="new-card" class="primary">＋ Create a card</button></section>
<div class="study-banner"><div><p class="eyebrow">A FEW MINUTES FOR YOUR FUTURE SELF</p><h2>Recall first.<br/>Then reveal.</h2><p>Try to answer before you turn the card. Mark what needs another look.</p><button id="start-session" class="primary">Start a practice session →</button></div><div class="card-art" aria-hidden="true"><div class="art-back"></div><div class="art-front"><span>ONE GOOD QUESTION</span><strong>What if<br/>you remember?</strong><small>01 / A LITTLE EVERY DAY</small></div></div></div>
<p id="notice" class="sr-only" role="status"></p><p id="storage-error" class="error" role="alert" hidden></p>
<section id="library"><div class="toolbar"><h2>Your card library <span id="card-count" class="count"></span></h2><div class="actions"><input id="search" class="control search" type="search" aria-label="Search cards" placeholder="Search questions or answers…"/><select id="deck-filter" class="control" aria-label="Filter deck"><option value="">All decks</option></select></div></div><div id="cards" class="card-library"></div><div id="empty" class="empty" hidden><span>◇</span><h2 id="empty-title"></h2><p id="empty-copy"></p><button id="load-samples" class="secondary">Load sample cards</button></div></section>
<section id="session" hidden><div class="toolbar"><h2>Practice session</h2><button id="leave-session" class="secondary">Back to library</button></div><div class="session-progress"><span id="session-count"></span><progress id="session-meter" max="1" value="0" aria-label="Session progress"></progress></div><button id="flashcard" class="flashcard" aria-label="Reveal answer" aria-pressed="false"><span id="card-side" class="eyebrow">QUESTION</span><strong id="card-content"></strong><span id="reveal-hint">Think first. Click to reveal.</span></button><div id="rating-actions" class="rating-actions" hidden><button id="again" class="secondary">Review again</button><button id="known" class="primary">I knew it ✓</button></div><div id="session-summary" class="empty" hidden><span>✓</span><h2>One session closer.</h2><p id="summary-copy"></p><button id="review-missed" class="primary">Practice missed cards</button><button id="finish-session" class="secondary">Back to library</button></div></section>
</main><footer><span>A learning project by <a href="https://github.com/yousefrajabi06-debug">Yousef Rajabi</a></span><span>Vanilla JavaScript · saved in this browser</span></footer></div>
<dialog id="editor" aria-labelledby="editor-title"><div class="dialog-top"><h2 id="editor-title">Create a card</h2><button id="close-editor" class="icon-button" aria-label="Close dialog">×</button></div><form id="card-form" class="form"><label>Deck<input id="deck" required maxlength="50" placeholder="e.g. JavaScript basics"/></label><label>Question<textarea id="question" required rows="3" maxlength="500" placeholder="What would you like to remember?"></textarea></label><label>Answer<textarea id="answer" required rows="4" maxlength="1500" placeholder="Write an answer in your own words."></textarea></label><p id="form-error" class="error" role="alert" hidden></p><div class="form-actions"><button id="cancel-editor" type="button" class="secondary">Cancel</button><button class="primary">Save card</button></div></form></dialog>
<dialog id="delete-dialog" aria-labelledby="delete-title"><div class="dialog-top"><h2 id="delete-title">Delete card?</h2></div><p>This card will be removed from your browser library.</p><div class="form-actions"><button id="keep-card" class="secondary">Keep card</button><button id="confirm-delete" class="danger">Delete card</button></div></dialog>`;

const $ = (selector) => document.querySelector(selector);
let cards = loadCards();
let editingId = null;
let deletingId = null;
let sessionCards = [];
let index = 0;
let missed = [];
let revealed = false;
const samples = [
  [
    "JavaScript",
    "What does Array.map return?",
    "A new array containing the result of calling a function on each element.",
  ],
  [
    "JavaScript",
    "Why check response.ok after fetch?",
    "fetch can resolve even when the server returns an HTTP error. response.ok tells us whether the status is successful.",
  ],
  [
    "JavaScript",
    "What is the difference between === and ==?",
    "Strict equality does not convert the operands to another type before comparison.",
  ],
  [
    "React",
    "What are props?",
    "Values passed from a parent component to a child. The child treats them as read-only.",
  ],
  [
    "React",
    "Why use a stable key when rendering a list?",
    "A key helps React associate each list item with its identity across updates.",
  ],
  [
    "Web basics",
    "Why connect a label to a form input?",
    "It gives the control an accessible name and makes the label clickable to focus it.",
  ],
];
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function announce(message) {
  $("#notice").textContent = message;
}
function persist() {
  const error = saveCards(cards);
  $("#storage-error").textContent = error;
  $("#storage-error").hidden = !error;
}
function filteredCards() {
  const query = $("#search").value.toLowerCase();
  const deck = $("#deck-filter").value;
  return cards.filter(
    (card) =>
      (!deck || card.deck === deck) &&
      `${card.question} ${card.answer}`.toLowerCase().includes(query),
  );
}
function renderLibrary() {
  const oldDeck = $("#deck-filter").value;
  const options = [element("option", "", "All decks")];
  options[0].value = "";
  [...new Set(cards.map((card) => card.deck))].sort().forEach((deck) => {
    const option = element("option", "", deck);
    option.value = deck;
    options.push(option);
  });
  $("#deck-filter").replaceChildren(...options);
  $("#deck-filter").value = options.some((option) => option.value === oldDeck)
    ? oldDeck
    : "";
  const visible = filteredCards();
  $("#card-count").textContent = visible.length;
  $("#start-session").disabled = !visible.length;
  $("#cards").replaceChildren();
  visible.forEach((card) => {
    const article = element("article", "library-card");
    article.append(
      element("span", "tag", card.deck),
      element("h3", "", card.question),
      element("p", "answer-preview", card.answer),
    );
    const actions = element("div", "card-actions");
    const edit = element("button", "text-button", "Edit card");
    edit.setAttribute("aria-label", `Edit ${card.question}`);
    edit.onclick = () => openEditor(card);
    const remove = element("button", "text-button danger-text", "Delete");
    remove.setAttribute("aria-label", `Delete ${card.question}`);
    remove.onclick = () => {
      deletingId = card.id;
      $("#delete-dialog").showModal();
    };
    actions.append(edit, remove);
    article.append(actions);
    $("#cards").append(article);
  });
  $("#empty").hidden = visible.length > 0;
  $("#empty-title").textContent = cards.length
    ? "No cards match this view."
    : "A little knowledge, ready to grow.";
  $("#empty-copy").textContent = cards.length
    ? "Try another deck or clear your search."
    : "Create a card in your own words, or try a small starter set.";
  $("#load-samples").hidden = cards.length > 0;
}
function openEditor(card) {
  editingId = card?.id || null;
  $("#editor-title").textContent = card ? "Edit card" : "Create a card";
  $("#deck").value = card?.deck || "Web basics";
  $("#question").value = card?.question || "";
  $("#answer").value = card?.answer || "";
  $("#form-error").hidden = true;
  $("#editor").showModal();
  $("#question").focus();
}
$("#new-card").onclick = () => openEditor();
$("#close-editor").onclick = $("#cancel-editor").onclick = () =>
  $("#editor").close();
$("#card-form").onsubmit = (event) => {
  event.preventDefault();
  const fields = {
    deck: $("#deck").value.trim(),
    question: $("#question").value.trim(),
    answer: $("#answer").value.trim(),
  };
  if (Object.values(fields).some((value) => !value)) {
    $("#form-error").textContent =
      "Complete every field with more than whitespace.";
    $("#form-error").hidden = false;
    return;
  }
  cards = editingId
    ? cards.map((card) =>
        card.id === editingId ? { ...card, ...fields } : card,
      )
    : [...cards, { ...fields, id: crypto.randomUUID() }];
  persist();
  $("#editor").close();
  renderLibrary();
  announce("Card saved.");
};
$("#keep-card").onclick = () => $("#delete-dialog").close();
$("#confirm-delete").onclick = () => {
  cards = cards.filter((card) => card.id !== deletingId);
  persist();
  $("#delete-dialog").close();
  renderLibrary();
  announce("Card deleted.");
};
$("#search").oninput = renderLibrary;
$("#deck-filter").onchange = renderLibrary;
$("#load-samples").onclick = () => {
  cards = samples.map(([deck, question, answer]) => ({
    id: crypto.randomUUID(),
    deck,
    question,
    answer,
  }));
  persist();
  renderLibrary();
  announce("Sample cards loaded.");
};
function startSession(items) {
  sessionCards = [...items];
  index = 0;
  missed = [];
  $("#library").hidden = true;
  $(".study-banner").hidden = true;
  $("#new-card").disabled = true;
  $("#session").hidden = false;
  renderSession();
}
function renderSession() {
  const finished = index >= sessionCards.length;
  $("#flashcard").hidden = finished;
  $("#session-summary").hidden = !finished;
  $("#rating-actions").hidden = true;
  $("#session-count").textContent =
    `${Math.min(index + 1, sessionCards.length)} of ${sessionCards.length} cards`;
  $("#session-meter").max = sessionCards.length || 1;
  $("#session-meter").value = index;
  if (finished) {
    $("#summary-copy").textContent =
      `You reviewed ${sessionCards.length} cards. ${sessionCards.length - missed.length} felt familiar; ${missed.length} could use another look.`;
    $("#review-missed").hidden = !missed.length;
    $("#finish-session").focus();
    announce("Session complete.");
    return;
  }
  revealed = false;
  $("#card-side").textContent = sessionCards[index].deck + " / QUESTION";
  $("#card-content").textContent = sessionCards[index].question;
  $("#reveal-hint").textContent = "Think first. Click to reveal.";
  $("#flashcard").setAttribute("aria-pressed", "false");
  $("#flashcard").setAttribute("aria-label", "Reveal answer");
  $("#flashcard").focus();
}
$("#start-session").onclick = () => startSession(filteredCards());
$("#flashcard").onclick = () => {
  revealed = !revealed;
  $("#card-side").textContent = revealed
    ? "ANSWER"
    : sessionCards[index].deck + " / QUESTION";
  $("#card-content").textContent = revealed
    ? sessionCards[index].answer
    : sessionCards[index].question;
  $("#reveal-hint").textContent = revealed
    ? "How did you do? Be honest with yourself."
    : "Think first. Click to reveal.";
  $("#flashcard").setAttribute("aria-pressed", String(revealed));
  $("#flashcard").setAttribute(
    "aria-label",
    revealed ? "Show question" : "Reveal answer",
  );
  $("#rating-actions").hidden = !revealed;
};
function rate(known) {
  if (!revealed) return;
  if (!known) missed.push(sessionCards[index]);
  index++;
  renderSession();
}
$("#again").onclick = () => rate(false);
$("#known").onclick = () => rate(true);
$("#review-missed").onclick = () => startSession(missed);
function leaveSession() {
  $("#session").hidden = true;
  $("#library").hidden = false;
  $(".study-banner").hidden = false;
  $("#new-card").disabled = false;
  renderLibrary();
  $("#start-session").focus();
}
$("#leave-session").onclick = $("#finish-session").onclick = leaveSession;
renderLibrary();
