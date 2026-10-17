import { test, expect } from "@playwright/test";
test("53 clients, source-linked preparation, and persistent conversation follow-through", async ({
  page,
}) => {
  await page.goto("/caseload");
  await expect(
    page.getByRole("heading", { name: "My Caseload", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Assigned clients" }).click();
  await expect(page.locator(".client-card")).toHaveCount(53);
  await page.getByRole("textbox", { name: "Search clients" }).fill("Margaret");
  await page.locator(".client-card").click();
  await expect(
    page.getByRole("heading", { name: "Margaret Wilson", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Sample AI output", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "note_1", exact: true }).click();
  await page.locator("#note_1 summary").click();
  await expect(
    page.getByText("Worker reports Margaret was unsteady", { exact: false }),
  ).toBeVisible();
  const form = page.locator("form").filter({
    has: page.getByRole("button", { name: "Save contact documentation" }),
  });
  await form.locator("[name=occurredAt]").fill("2026-10-01T10:30");
  await form
    .locator("[name=summary]")
    .fill(
      "Fictional conversation completed. Margaret asked us to check physiotherapy options.",
    );
  await form.locator("[name=followUp]").check();
  await form
    .getByRole("button", { name: "Save contact documentation" })
    .click();
  await expect(page.getByRole("status")).toContainText("Contact documented");
  const taskForm = page.locator("form").filter({
    has: page.getByRole("button", { name: "Create follow-up", exact: true }),
  });
  await taskForm
    .locator("[name=title]")
    .fill("Call Anna with physiotherapy options");
  await taskForm
    .locator("[name=description]")
    .fill("Check provider availability and report options to Anna.");
  await taskForm.locator("[name=ownerId]").selectOption("Sarah Mitchell");
  await taskForm.locator("[name=dueDate]").fill("2026-10-20");
  await taskForm
    .getByRole("button", { name: "Create follow-up", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Call Anna with physiotherapy options",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Call Anna with physiotherapy options",
      exact: true,
    }),
  ).toBeVisible();
  const progress = page.locator("form").filter({
    has: page.getByRole("button", { name: "Update status", exact: true }),
  });
  await progress.locator("[name=status]").selectOption("RESOLVED");
  await progress
    .getByRole("button", { name: "Update status", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "outcome",
  );
  await progress
    .locator("[name=note]")
    .fill("Anna informed that the provider will call to arrange assessment.");
  await progress
    .getByRole("button", { name: "Update status", exact: true })
    .click();
  await expect(page.locator(".timeline")).toContainText("Resolved");
  await progress.locator("[name=status]").selectOption("OPEN");
  await progress
    .locator("[name=note]")
    .fill("Anna requested a different appointment time.");
  await progress
    .getByRole("button", { name: "Update status", exact: true })
    .click();
  await expect(page.locator(".timeline")).toContainText("Reopened");
  await expect(page.locator(".timeline")).toContainText("Anna informed");
  await page.getByRole("link", { name: "My Caseload", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open follow-ups" }),
  ).toContainText("6");
});
test("overdue, blocked, no-change and reopening seed scenarios", async ({
  page,
}) => {
  await page.goto("/caseload");
  await page.getByRole("button", { name: "Overdue", exact: false }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Helen Parker");
  await page.goto("/follow-ups");
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("BLOCKED");
  await expect(page.locator("tbody")).toContainText("Robert Chen");
  await page.goto("/clients/client_4/prep");
  await expect(
    page.getByText("No new notable change detected", { exact: false }),
  ).toBeVisible();
  await page.goto("/follow-ups/task_4");
  await expect(page.locator(".timeline")).toContainText("Resolved");
  await expect(page.locator(".timeline")).toContainText("Reopened");
});

test("tablet navigation and source review controls work", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto("/clients/client_1/prep");
  await page
    .getByRole("textbox", { name: "Talking points" })
    .fill("Ask Margaret how her support is working.");
  await page
    .getByRole("combobox", { name: "Priority for obs_1" })
    .selectOption("high");
  await page
    .getByRole("button", { name: "Confirm observation", exact: true })
    .click();
  await expect(page.locator("#obs_1")).toContainText("Human confirmed");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Talking points" }),
  ).toHaveValue("Ask Margaret how her support is working.");
  await expect(
    page.getByRole("combobox", { name: "Priority for obs_1" }),
  ).toHaveValue("high");
  await page.goto("/follow-ups?new=1");
  await expect(
    page.getByRole("heading", { name: "Create a follow-up", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close form", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Create a follow-up", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "My Caseload", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Search clients" })
    .fill("Nobody matching this fictional name");
  await expect(
    page.getByText("No work items match these filters.", { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("corrupted browser records show a recoverable error instead of crashing", async ({
  page,
}) => {
  await page.goto("/caseload");
  await page.evaluate(() =>
    localStorage.setItem(
      "care-manager-demo-v1",
      JSON.stringify({
        version: 1,
        clients: [{}],
        notes: [],
        interactions: [],
        observations: [],
        followUps: [],
        discussionPoints: {},
      }),
    ),
  );
  await page.reload();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "incompatible",
  );
  await expect(
    page.getByRole("heading", { name: "My Caseload", exact: true }),
  ).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset demo data" }).click();
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Assigned clients" }),
  ).toContainText("53");
});
