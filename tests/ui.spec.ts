import {test,expect} from "@playwright/test";


const url = "http://localhost:5173/";
test("アクセスできるか",async({page})=>{
    await page.goto(url);
    await expect(page).toHaveTitle("ゆめみ Coding Test");
});

test("CheckBoxが存在してるか",async({page})=>{
    await page.goto(url);
    const checkbox = page.getByText("北海道");
    expect(checkbox).toBeTruthy();
});

test("prefecturesがfetchできなかったとき，エラーは出るか",async({page},testInfo)=>{
    await page.route("https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures",async (route) =>{
        await route.fulfill({
            status: 403,
            contentType: "application/json; charset=UTF-8",
            body: "Forbidden",
        });
    });
    await page.goto(url);
    const yumemi_res = await page.waitForResponse((res) => res.url() === "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures");
    const error_text = page.getByText("prefectures fetch error");
    const screenshot = await page.screenshot();
    testInfo.attach("Screen",{
        body: screenshot,
        contentType: "image/png"
    });
    expect(error_text).toBeTruthy();

});