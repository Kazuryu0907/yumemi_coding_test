import * as z from "zod";

const PrefectureSchema = z.object({
    prefCode: z.number(),
    prefName: z.string()
});

export type Prefecture = z.infer<typeof PrefectureSchema>;

const PrefectureResponseSchema = z.object({
    message: z.string(),
    result: z.array(PrefectureSchema)
});
export type PrefecturesResponse = z.infer<typeof PrefectureResponseSchema>;


export const ALL_LABELS = ["総人口","年少人口","生産年齢人口","老年人口"] as const;
export type label_tuple = typeof ALL_LABELS;
export type label_type = label_tuple[number];
const PopulationDataSchema = z.array(
    z.object({
            year: z.number(),
            value: z.number(),
            rate: z.number()
    }));
const PopulationCompositionPerYearSchema = z.object({
    boundaryYear: z.number(),
    data: z.array(z.object({
        label: z.enum(ALL_LABELS),
        data: PopulationDataSchema,
    }))
});
export type PopulationCompositionPerYear = z.infer<typeof PopulationCompositionPerYearSchema>;

const PopulationCompositionPerYearResponseSchema = z.object({
    message: z.string(),
    result: PopulationCompositionPerYearSchema
});
export type PopulationCompositionPerYearResponse = z.infer<typeof PopulationCompositionPerYearResponseSchema>;


// ! Validation必要?
/**
 * prefectures一覧をfetchする
 * @returns {Promise<PrefecturesResponse>} Responseのjson生データ
 */
export async function fetch_prefectures(){
    const url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures";
    const res = await fetch(url,{
        headers: {
            "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
        }
    });
    const text = await res.text();
    const json:PrefecturesResponse = JSON.parse(text);
    const result = PrefectureResponseSchema.safeParse(json);
    return json;
}

// ! Validation必要?
/**
 * prefCodeの人口をfetchする
 * @param {number} prefCode PrefectureのprefCode属性
 * @returns {Promise<PopulationCompositionPerYearResponse>} Responseのjson生データ
 */
export async function fetch_population(prefCode: number){
    const base_url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear";
    const url = `${base_url}?prefCode=${prefCode}`
    const res = await fetch(url,{
        headers: {
            "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
        },
        // * 出生データという特徴から，更新されにくいためBrowserのcacheに任せる．
        cache: "default",
    });
    const text = await res.text();
    const json:PopulationCompositionPerYearResponse = JSON.parse(text);
    return json;
}