import { test, expect } from "@playwright/test";
async function addCard(page) {
  await page
    .getByRole("button", { name: "Create a card", exact: false })
    .click();
  await page.getByLabel("Deck", { exact: true }).fill("Demo deck");
  await page.getByLabel("Question", { exact: true }).fill("What is a promise?");
  await page
    .getByLabel("Answer", { exact: true })
    .fill("A value representing eventual completion.");
  await page.getByRole("button", { name: "Save card" }).click();
}
test("card CRUD and storage", async ({ page }) => {
  await page.goto("/");
  await addCard(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "What is a promise?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit What is a promise?", exact: true })
    .click();
  await page.getByLabel("Question", { exact: true }).fill("What is async?");
  await page.getByRole("button", { name: "Save card" }).click();
  await page.getByLabel("Search cards").fill("missing");
  await expect(page.getByText("No cards match this view.")).toBeVisible();
  await page.getByLabel("Search cards").fill("");
  await page
    .getByRole("button", { name: "Delete What is async?", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete card", exact: true }).click();
  await expect(
    page.getByText("A little knowledge, ready to grow."),
  ).toBeVisible();
});
test("review session reveals answers and repeats missed cards", async ({
  page,
}) => {
  await page.goto("/");
  await addCard(page);
  await page.getByRole("button", { name: "Start a practice session" }).click();
  await page
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await expect(page.locator("#card-content")).toHaveText(
    "A value representing eventual completion.",
  );
  await page.getByRole("button", { name: "Review again", exact: true }).click();
  await expect(page.getByText("One session closer.")).toBeVisible();
  await page.getByRole("button", { name: "Practice missed cards" }).click();
  await page
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await page.getByRole("button", { name: "I knew it" }).click();
  await expect(page.locator("#summary-copy")).toContainText(
    "1 felt familiar; 0 could use another look",
  );
});
test("card text cannot inject HTML; mobile remains within viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create a card", exact: false })
    .click();
  await page
    .getByLabel("Question", { exact: true })
    .fill("<img src=x onerror=alert(1)>");
  await page.getByLabel("Answer", { exact: true }).fill("Plain text");
  await page.getByRole("button", { name: "Save card" }).click();
  await expect(page.locator(".library-card img")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "<img src=x onerror=alert(1)>" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
