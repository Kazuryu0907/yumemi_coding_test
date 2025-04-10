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