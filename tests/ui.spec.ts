import { expect, test } from "@playwright/test";

const url = "http://localhost:5173/";
test("アクセスできるか", async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle("ゆめみ Coding Test");
});

test("CheckBoxが存在してるか", async ({ page }) => {
  await page.goto(url);
  await page.waitForResponse((res) =>
    res.url() === "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures"
  );
  const checkbox = await page.$("#checkbox-北海道");
  expect(checkbox).toBeTruthy();
});

test("prefecturesがfetchできなかったとき，エラーは出るか", async ({ page }, testInfo) => {
  await page.route("https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json; charset=UTF-8",
      body: "Forbidden",
    });
  });
  await page.goto(url);
  await page.waitForResponse((res) =>
    res.url() === "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures"
  );
  const errorText = page.getByText("prefectures fetch error");
  const screenshot = await page.screenshot();
  testInfo.attach("Screen", {
    body: screenshot,
    contentType: "image/png",
  });
  expect(errorText).toBeTruthy();
});

test("populationがfetchできなかったとき，エラーは出るか", async ({ page }, testInfo) => {
  await page.route(
    "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear?prefCode=1",
    async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json; charset=UTF-8",
        body: "Forbidden",
      });
    },
  );
  await page.goto(url);
  const checkbox = page.getByRole("checkbox", { name: "北海道" });
  await checkbox.click();
  await page.waitForResponse((res) =>
    res.url()
      === "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear?prefCode=1"
  );
  const errorText = page.getByText("population fetch error");
  const screenshot = await page.screenshot();
  testInfo.attach("Screen", {
    body: screenshot,
    contentType: "image/png",
  });
  expect(errorText).toBeTruthy();
});

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));
test("checkBoxを押すと，UIが変化するか", async ({ page }, testInfo) => {
  await page.goto(url);
  const graph = page.getByTestId("graph");
  await page.waitForResponse((res) =>
    res.url() === "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures"
  );
  const emptyGraphHtml = await graph.innerHTML();
  const checkbox = page.getByRole("checkbox", { name: "北海道" });
  await checkbox.click();
  expect(await checkbox.isChecked()).toBe(true);
  await sleep(3000);
  const plotedGraphHtml = await graph.innerHTML();
  const screenshot = await page.screenshot();
  testInfo.attach("Screen", {
    body: screenshot,
    contentType: "image/png",
  });
  expect(emptyGraphHtml === plotedGraphHtml).toBe(false);
});
