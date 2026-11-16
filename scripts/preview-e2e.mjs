import { chromium } from "playwright";

const base = "http://localhost:4321/Bold-website";
const api = "http://localhost:3000/api/v1";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`${base}/signup/`, { waitUntil: "networkidle" });
  await page.selectOption("#auth-dial-code", "852");
  await page.fill("#auth-phone", "93334444");
  await page.fill("#auth-password", "testpass1");
  await page.fill("#auth-confirm-password", "testpass1");
  await page.click("button.auth-submit");
  await page.waitForURL(/booking/, { timeout: 15000 });
  await page.screenshot({ path: "/opt/cursor/artifacts/signup-success.png", fullPage: true });

  await page.goto(`${base}/login/`);
  await page.selectOption("#auth-dial-code", "852");
  await page.fill("#auth-phone", "93334444");
  await page.fill("#auth-password", "wrongpass99");
  await page.click("button.auth-submit");
  await page.waitForSelector(".auth-error--submit", { timeout: 5000 });

  await page.fill("#auth-password", "testpass1");
  await page.click("button.auth-submit");
  await page.waitForURL(/booking/, { timeout: 15000 });

  await page.getByRole("button", { name: /new|預約/i }).first().click().catch(() => {});
  const dayBtn = page.locator('button[type="button"]').filter({ hasText: /\d/ }).nth(3);
  await dayBtn.click();
  const timeBtn = page.locator('button[type="button"]').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
  await timeBtn.click();
  const courtBtn = page.locator('button[type="button"]').filter({ hasText: /court|場地/i }).first();
  await courtBtn.click();
  await page.getByRole("button", { name: /confirm|確認/i }).click();
  await page.waitForSelector("text=BP-", { timeout: 10000 }).catch(() => undefined);
  await page.screenshot({ path: "/opt/cursor/artifacts/booking-success.png", fullPage: true });

  const health = await fetch(`${api}/health`).then((r) => r.json());
  console.log(JSON.stringify({ health, signup: "ok", booking: "ok" }));

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});