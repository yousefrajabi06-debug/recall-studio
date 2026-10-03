# Learning guide — Recall Studio

A focused flashcard studio built with plain JavaScript to practice the fundamentals.

## Important files

- [`src/main.js`](../src/main.js): DOM rendering, event handlers, card forms, and review-session state.
- [`src/lib/storage.js`](../src/lib/storage.js): Saved-card validation and localStorage read/write handling.
- [`src/styles.css`](../src/styles.css): Responsive library, forms, and practice view.
- [`tests/app.spec.js`](../tests/app.spec.js): Card CRUD, persistence, review progression, safe rendering, and mobile checks.

## Five things to study

1. Trace an event handler from a user action to state and a DOM update.
2. Explain why user content is rendered with textContent/value rather than HTML interpolation.
3. Keep the card library separate from the active review-session queue.
4. Use array methods to compute missed cards and restart a focused session.
5. Understand ES module imports and localStorage serialization.

## One feature to build independently

Add a keyboard shortcut to reveal an answer, while ignoring keystrokes inside form fields.

## Rebuild to understand

Start in an empty branch or separate practice folder. Rebuild the main form and one data update without copying, then add persistence or the API request. Explain the data flow aloud and recreate one behavior test. Compare your work with the original only after it works.

## Honest presentation

This is an AI-assisted learning project. Describe the code you can explain and the features you rebuilt yourself. Do not present it as employment, client work, or proof of independent mastery before studying it.
