
import {fetch_population,fetch_prefectures} from "./src/api";


test("fetch_prefecturesのValidationテスト",async()=>{
    const res = await fetch_prefectures();
    if(!res.success){
        console.error(res.error);
    }
    expect(res.success).toBe(true);
});

test("fetch_populationのValidationテスト",async()=>{
    const res = await fetch_population(1);
    if(!res.success){
        console.error(res.error);
    }
    expect(res.success).toBe(true);
});
