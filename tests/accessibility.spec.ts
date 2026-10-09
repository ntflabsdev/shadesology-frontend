import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const phaseOneRoutes = [
  "/",
  "/about",
  "/products",
  "/products/accessibility-audit-sample",
  "/category/outdoor-shades",
  "/segments/commercial",
  "/segments/sample",
  "/search",
  "/resources",
  "/find-installer",
  "/find-installer/sample-installer",
  "/contact",
  "/commercial",
  "/dealer",
  "/dealer/apply",
  "/installer-signup",
  "/installer-signup/status",
  "/installer/portal",
  "/quote",
  "/quote/basket",
  "/quote/status/SAMPLE-1",
  "/cart",
  "/checkout",
  "/checkout/complete",
  "/account",
  "/account/orders",
  "/financing/status",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password/sample-token",
  "/verify-email/sample-token",
  "/support",
  "/support/faq",
  "/support/orders",
  "/support/service",
  "/warranty",
  "/privacy",
  "/accessibility",
  "/sitemap",
  "/dev/components",
  "/admin/financing-offers",
  "/admin/installers",
  "/admin/leads",
  "/admin/orders",
  "/admin/orders/sample-id",
  "/admin/quotes",
  "/admin/quotes/sample-id",
  "/admin/shipping-rates",
];

for (const route of phaseOneRoutes) {
  test(`WCAG 2.1 AA: ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status(), `Route ${route} failed to render`).toBeLessThan(500);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map(({ id, impact, description, nodes }) => ({
        id,
        impact,
        description,
        elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
      })),
      `WCAG violations on ${route}`,
    ).toEqual([]);
  });
}

test("does not request analytics or marketing tags before consent", async ({ page }) => {
  const thirdPartyRequests: string[] = [];
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    if (
      /google-analytics|googletagmanager|doubleclick|hubspot|hs-scripts/i.test(requestUrl.hostname)
    ) thirdPartyRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeVisible();
  expect(thirdPartyRequests).toEqual([]);
});

test("GA4 loads only after analytics consent and receives consented funnel events", async ({ page }) => {
  const analyticsRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("googletagmanager.com/gtag/js")) analyticsRequests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeVisible();
  expect(analyticsRequests).toEqual([]);

  await page.getByRole("button", { name: "Accept all" }).click();
  await expect.poll(() => analyticsRequests.length).toBe(1);
  await expect.poll(async () => page.evaluate(() => {
    const layer = (window as Window & { dataLayer?: unknown[][] }).dataLayer ?? [];
    return layer.some((entry) => entry[0] === "event" && entry[1] === "page_view");
  })).toBe(true);

  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("shadesology:conversion", {
      detail: {
        event: "checkout_started",
        currency: "USD",
        value: 1299,
        items: [{ item_id: "product-1", item_name: "Outdoor Awning", quantity: 1 }],
      },
    }));
  });
  await expect.poll(async () => page.evaluate(() => {
    const layer = (window as Window & { dataLayer?: unknown[][] }).dataLayer ?? [];
    return layer.some((entry) =>
      entry[0] === "event" &&
      entry[1] === "begin_checkout" &&
      typeof entry[2] === "object" &&
      entry[2] !== null &&
      "items" in entry[2]
    );
  })).toBe(true);
});

test("paid checkout sends one product-level purchase event after analytics consent", async ({ page }) => {
  await page.route("**/api/payments/session/analytics-session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      success: true,
      data: {
        paid: true,
        orderNumber: "SH-ANALYTICS-1",
        total: 1299,
        currency: "USD",
        paymentStatus: "paid",
        balanceDue: 0,
        tax: 99,
        shipping: 100,
        items: [{
          productId: "product-1",
          itemName: "Outdoor Awning",
          itemVariant: "12 ft",
          itemSku: "AWN-12",
          quantity: 1,
          price: 1100,
        }],
      },
    }),
  }));
  await page.route("https://www.googletagmanager.com/gtag/js?id=G-TEST12345", (route) =>
    route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.goto("/checkout/complete?session_id=analytics-session");
  await expect(page.getByRole("heading", { name: "Payment confirmed" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const layer = (window as Window & { dataLayer?: unknown[][] }).dataLayer ?? [];
    return layer.some((entry) => entry[0] === "event" && entry[1] === "purchase");
  })).toBe(false);
  await page.getByRole("button", { name: "Accept all" }).click();

  const purchaseEvents = () => page.evaluate(() => {
    const layer = (window as Window & { dataLayer?: unknown[][] }).dataLayer ?? [];
    return layer.filter((entry) =>
      entry[0] === "event" &&
      entry[1] === "purchase" &&
      typeof entry[2] === "object" &&
      entry[2] !== null
    ).map((entry) => entry[2]);
  });
  await expect.poll(async () => (await purchaseEvents()).length).toBe(1);
  expect(await purchaseEvents()).toContainEqual(expect.objectContaining({
    transaction_id: "SH-ANALYTICS-1",
    value: 1299,
    tax: 99,
    shipping: 100,
    items: [expect.objectContaining({
      item_id: "product-1",
      item_name: "Outdoor Awning",
      item_variant: "12 ft",
      price: 1100,
      quantity: 1,
    })],
  }));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Payment confirmed" })).toBeVisible();
  await expect.poll(async () => (await purchaseEvents()).length).toBe(0);
  expect(await purchaseEvents()).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.getItem("shadesology:conversion:purchase:SH-ANALYTICS-1"))).toBe("1");
});

test("conversion events stay silent until an optional consent choice is saved", async ({ page }) => {
  await page.route("**/api/privacy/consent", (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({ success: true, data: { id: "consent-test" } }),
  }));
  await page.goto("/contact");
  await page.evaluate(() => {
    (window as Window & { conversionCount?: number }).conversionCount = 0;
    window.addEventListener("shadesology:conversion", () => {
      const target = window as Window & { conversionCount?: number };
      target.conversionCount = (target.conversionCount ?? 0) + 1;
    });
  });
  const trackPrimaryAction = () => page.locator("[data-conversion-event]").first().evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), { once: true });
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await trackPrimaryAction();
  expect(await page.evaluate(() => (window as Window & { conversionCount?: number }).conversionCount)).toBe(0);

  await page.getByRole("button", { name: "Accept all" }).click();
  await expect(page.getByRole("heading", { name: "Your privacy choices" })).toBeHidden();
  await trackPrimaryAction();
  expect(await page.evaluate(() => (window as Window & { conversionCount?: number }).conversionCount)).toBe(1);
});

test("mobile navigation traps focus, closes on Escape, and restores trigger focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Site menu" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Shadesology" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("link", { name: /1-800-SHADES-0/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("link", { name: "Shadesology" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("modal traps focus, closes on Escape, and restores trigger focus", async ({ page }) => {
  await page.goto("/dev/components", { waitUntil: "networkidle" });
  const trigger = page.getByRole("button", { name: "Open Modal" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Request a Quote" });
  await expect(dialog).toBeVisible();
  const closeButton = dialog.getByRole("button", { name: "Close modal" });
  const lastButton = dialog.getByRole("button", { name: "Submit Quote" });
  await expect(closeButton).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(lastButton).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
