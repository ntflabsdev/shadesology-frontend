import { expect, test } from "@playwright/test";

const API_URL = "http://127.0.0.1:5100";
const productName = "Phase One Retractable Awning";

test.beforeEach(async ({ page, request }) => {
  await request.post(`${API_URL}/__test/reset`);
  await page.addInitScript(() => {
    localStorage.setItem("shadesology-consent-v1", JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
    }));
  });
});

async function browseAndConfigureProduct(page: import("@playwright/test").Page) {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "All Products" })).toBeVisible();
  await page.getByRole("link", { name: `View details for ${productName}` }).click();
  await expect(page.getByRole("heading", { name: productName })).toBeVisible();
  await page.getByRole("radio", { name: "Select Premium 3m × 2m" }).check({ force: true });
}

test("portal dialogs hydrate without server/client markup mismatches", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydration|server rendered html|didn't match|did not match/i.test(message.text())
    ) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/dev/components");
  await expect(page.getByRole("heading", { name: "Design System Showcase" })).toBeVisible();
  await page.waitForTimeout(100);

  expect(hydrationErrors).toEqual([]);
});

test("dynamic route props are awaited on segment and search pages", async ({ page }) => {
  const routeErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /params is a Promise|searchParams\.[a-z]+|must be unwrapped/i.test(message.text())
    ) {
      routeErrors.push(message.text());
    }
  });

  const segmentResponse = await page.goto("/segments/commercial");
  expect(segmentResponse?.status()).toBeLessThan(500);
  const searchResponse = await page.goto("/search?q=awning");
  expect(searchResponse?.status()).toBeLessThan(500);
  expect(routeErrors).toEqual([]);
});

test("product comparison resolves selected slugs to default variants", async ({ page, request }) => {
  await page.goto("/category/awnings");
  await page.getByRole("checkbox", { name: "Compare Phase One Retractable Awning" }).check();
  await expect(page.getByText("1 of 4 products selected for comparison.")).toBeVisible();
  await page.getByRole("link", { name: "Compare selected" }).click();
  await expect(page.getByRole("table", { name: "Side-by-side product specifications" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Phase One Retractable Awning" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Width \(m\).*3–3/ })).toBeVisible();

  const compareRequests = await request.get(`${API_URL}/__test/compare-requests`);
  expect((await compareRequests.json()).data).toContainEqual(["phase1-variant-standard"]);

  await page.goto("/category/awnings");
  await expect(page.getByRole("checkbox", { name: "Compare Phase One Retractable Awning" })).toBeChecked();
});

test("browse, configure, add to cart, pay, and confirm the order", async ({ page }) => {
  await browseAndConfigureProduct(page);
  await page.getByRole("button", { name: `Add ${productName} to cart` }).click();
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: "Your Cart" })).toBeVisible();
  await expect(page.getByText("Premium 3m × 2m")).toBeVisible();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();

  await page.getByLabel("First name").fill("Avery");
  await page.getByLabel("Last name").fill("Tester");
  await page.getByLabel("Email").fill("avery@example.test");
  await page.getByRole("button", { name: "Continue to Shipping" }).click();

  await page.getByLabel("Address line 1").fill("123 Test Street");
  await page.getByLabel("City").fill("Miami");
  await page.getByLabel("State").selectOption("FL");
  await page.getByLabel("ZIP code").fill("33101");
  await page.getByRole("button", { name: "Review Order" }).click();
  await expect(page.getByRole("heading", { name: "Review your order" })).toBeVisible();

  await page.getByRole("button", { name: "Continue to secure payment" }).click();
  await expect(page).toHaveURL(/\/checkout\/complete\?session_id=phase1-payment-session$/);
  await expect(page.getByRole("heading", { name: "Payment confirmed" })).toBeVisible();
  await expect(page.getByText("Order SH-E2E-0001 is confirmed.")).toBeVisible();
});

test("submit an uploaded quote, prepare its response, and convert it to an order", async ({ page }) => {
  await browseAndConfigureProduct(page);
  await page.getByRole("button", { name: "Add to Quote" }).click();
  await page.getByRole("link", { name: /View quote basket/ }).click();
  await expect(page.getByRole("heading", { name: "Quote Basket" })).toBeVisible();

  await page.getByLabel("Upload attachments").setInputFiles({
    name: "site-drawing.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 test drawing"),
  });
  await expect(page.getByText("site-drawing.pdf")).toBeVisible();
  await page.getByLabel("First name").fill("Avery");
  await page.getByLabel("Last name").fill("Tester");
  await page.getByLabel("Email").fill("avery@example.test");
  await page.getByLabel("Project description").fill("Please quote this awning for my test project.");
  await page.getByLabel("Address / City").fill("123 Test Street, Miami, FL");
  await page.getByRole("button", { name: "Submit Quote Request" }).click();
  await expect(page.getByRole("heading", { name: "Quote Request Received" })).toBeVisible();
  await expect(page.getByText("QT-E2E-0001")).toBeVisible();

  await page.goto("/admin/quotes/phase1-quote-id");
  await expect(page.getByRole("heading", { name: "Quote QT-E2E-0001" })).toBeVisible();
  await expect(page.getByText("site-drawing.pdf")).toBeVisible();
  await page.getByLabel(/Status/).selectOption("accepted");
  await page.getByLabel("Subtotal (USD)").fill("15.00");
  await page.getByLabel("Tax (USD)").fill("1.20");
  await page.getByLabel("Total (USD)", { exact: true }).fill("16.20");
  await page.getByRole("button", { name: "Save quote" }).click();
  await expect(page.getByRole("status")).toContainText("Quote updated.");

  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Convert accepted quote to order" }).click();
  await expect(page.getByRole("status")).toContainText("SH-QUOTE-E2E-0001");
});

test("renders the fixed, percentage, per-unit, and zero-surcharge price matrix", async ({ page, request }) => {
  await request.post(`${API_URL}/__test/reset?fixture=pricing-matrix`);
  await page.goto("/cart");
  await expect(page.getByText("No surcharge")).toBeVisible();
  await expect(page.getByText("Fixed surcharge")).toBeVisible();
  await expect(page.getByText("Percent surcharge")).toBeVisible();
  await expect(page.getByText("Per-unit surcharge")).toBeVisible();
  await expect(page.getByText("$10.50", { exact: true })).toBeVisible();
  await expect(page.getByText("$12.00", { exact: true })).toBeVisible();
  await expect(page.getByText("$16.00", { exact: true })).toBeVisible();
  await expect(page.getByText("+$0.50 options", { exact: true })).toBeVisible();
  await expect(page.getByText("+$2.00 options", { exact: true })).toBeVisible();
  await expect(page.getByText("+$6.00 options", { exact: true })).toBeVisible();
});

test("shows retail pricing without exposing dealer tier data", async ({ page }) => {
  await browseAndConfigureProduct(page);
  await expect(page.getByText("Dealer Price")).toHaveCount(0);
  await expect(page.getByRole("radiogroup", { name: "Model / Size" }).getByText("$15.00")).toBeVisible();
  const html = await page.locator("body").innerText();
  expect(html).not.toContain("$6.00");
  expect(html).not.toContain("priceTiers");
});

test("installer contact details remain hidden until the assigned lead is accepted", async ({ page }) => {
  await page.goto("/installer/portal");
  await expect(page.getByRole("heading", { name: "Test Installer" })).toBeVisible();
  await expect(page.getByText("private.customer@example.test")).toHaveCount(0);
  await expect(page.getByText("Customer contact information is revealed only after you accept an assigned lead.")).toBeVisible();

  await page.getByRole("button", { name: "Accept and view contact" }).click();
  await expect(page.getByText("private.customer@example.test")).toBeVisible();
  await expect(page.getByText("555-0101")).toBeVisible();
});

test("contact form confirms submission when notification and CRM services are unavailable", async ({ page }) => {
  const reset = await page.request.post(`${API_URL}/__test/reset?fixture=lead-service-outage`);
  expect(reset.ok()).toBeTruthy();
  await page.goto("/contact");
  await page.getByLabel("Full Name").fill("Avery Tester");
  await page.locator("#email").fill("avery@example.test");
  await page.getByLabel("Subject").selectOption("other");
  await page.getByLabel("Message").fill("I would like help selecting a shade for my patio.");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByRole("heading", { name: "Message Sent!" })).toBeVisible();

  const persistedLeads = await page.request.get(`${API_URL}/__test/leads`);
  const body = await persistedLeads.json() as { data: Array<{ crmSyncStatus: string; notificationStatus: string }> };
  expect(body.data).toHaveLength(1);
  expect(body.data[0].crmSyncStatus).toBe("pending");
  expect(body.data[0].notificationStatus).toBe("failed");
});
