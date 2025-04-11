import {fetch_population,fetch_prefectures} from "../src/api";
// import {test,expect} from "@playwright/test";

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

describe("fetchのMockテスト",() =>{
    // 毎回Mock初期化
    beforeEach(()=>{
        jest.resetAllMocks();
    });

    test("fetch_prefeturesの200以外のテスト",async()=>{
        const mockResponse = async() => {
            return {
                status:403,
                statusText: "Forbidden",
                text: ()=> "Forbidden",
            }
        }
        (global.fetch as any) = jest.fn().mockImplementation(mockResponse);
        const res = await fetch_prefectures();
        expect(res.success).toBe(false);
    });
    test("fetch_populationの200以外のテスト",async()=>{
        const mockResponse = async() => {
            return {
                status:403,
                statusText: "Forbidden",
                text: ()=> "Forbidden",
            }
        }
        (global.fetch as any) = jest.fn().mockImplementation(mockResponse);
        const res = await fetch_population(1);
        expect(res.success).toBe(false);
    });
});
