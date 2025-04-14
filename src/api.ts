/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";

const PrefectureSchema = z.object({
    prefCode: z.number(),
    prefName: z.string()
});

export type Prefecture = z.infer<typeof PrefectureSchema>;

const PrefectureResponseSchema = z.object({
    message: z.string().nullable(),
    result: z.array(PrefectureSchema)
});
export type PrefecturesResponse = z.infer<typeof PrefectureResponseSchema>;


export const ALL_LABELS = ["総人口","年少人口","生産年齢人口","老年人口"] as const;
export type label_tuple = typeof ALL_LABELS;
export type label_type = label_tuple[number];
const PopulationMonoDataSchema = z.object({
    year: z.number(),
    value: z.number(),
    rate: z.number().optional()
})
const PopulationDataSchema = z.object({
    label: z.enum(ALL_LABELS),
    data: z.array(PopulationMonoDataSchema),
});
const PopulationCompositionPerYearSchema = z.object({
    boundaryYear: z.number(),
    data: z.array(PopulationDataSchema)
});
export type PopulationCompositionPerYear = z.infer<typeof PopulationCompositionPerYearSchema>;

const PopulationCompositionPerYearResponseSchema = z.object({
    message: z.string().nullable(),
    result: PopulationCompositionPerYearSchema
});
export type PopulationCompositionPerYearResponse = z.infer<typeof PopulationCompositionPerYearResponseSchema>;


/**
 * zodのsafeParse用に，JSON.parseでエラーを出さないための関数 
 * @param {string} data JSON.parseするデータ
 * @returns parseできた場合は，JSON Object．できなかった場合は空Object{}
 */
const json_safeParse = (data:string):object =>{
    try{
        const json = JSON.parse(data);
        return json;
    }catch(_){
        return {};
    }
}

/**
 * prefectures一覧をfetchする
 * @returns {Promise<z.SafeParseReturnType<PrefecturesResponse,PrefecturesResponse>>} ResponseのzodでsafeParseしたResult
 */
export async function fetch_prefectures(): Promise<z.SafeParseReturnType<PrefecturesResponse,PrefecturesResponse>>{
    const url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures";
    // fetchがthrow Errorを起こしうるので囲む
    // ErrorはzodのsafeParseに吸収させる
    const res = await fetch(url,{
        headers: {
            "X-API-KEY": import.meta.env.VITE_X_API_KEY
        }
    });
    const text = await res.text();
    const json = json_safeParse(text);
    const result = PrefectureResponseSchema.safeParse(json);
    return result;
}

/**
 * prefCodeの人口をfetchする
 * @param {number} prefCode PrefectureのprefCode属性
 * @returns {Promise<z.SafeParseReturnType<PopulationCompositionPerYearResponse,PopulationCompositionPerYearResponse>>} Responseのjson生データ
 */
export type fetch_population_return_type = Promise<z.SafeParseReturnType<PopulationCompositionPerYearResponse,PopulationCompositionPerYearResponse>>;
export async function fetch_population(prefCode: number): fetch_population_return_type {
    const base_url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear";
    const url = `${base_url}?prefCode=${prefCode}`
    // fetchがthrow Errorを起こしうるので囲む
    // ErrorはzodのsafeParseに吸収させる
    let text;
    try{
        const res = await fetch(url,{
            headers: {
                "X-API-KEY": import.meta.env.VITE_X_API_KEY
            },
            // * 出生データという特徴から，更新されにくいためBrowserのcacheに任せる．
            cache: "default",
        });
        text = await res.text();
    }catch(e){
        text = "";
    }
    const json = json_safeParse(text);
    const result = PopulationCompositionPerYearResponseSchema.safeParse(json);
    return result;
}