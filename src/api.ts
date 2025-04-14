/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from "zod";

const prefectureSchema = z.object({
  prefCode: z.number(),
  prefName: z.string(),
});

export type Prefecture = z.infer<typeof prefectureSchema>;

const prefectureResponseSchema = z.object({
  message: z.string().nullable(),
  result: z.array(prefectureSchema),
});
export type PrefecturesResponse = z.infer<typeof prefectureResponseSchema>;

export const ALL_LABELS = ["総人口", "年少人口", "生産年齢人口", "老年人口"] as const;
export type LabelTuple = typeof ALL_LABELS;
export type LabelType = LabelTuple[number];
const populationMonoDataSchema = z.object({
  year: z.number(),
  value: z.number(),
  rate: z.number().optional(),
});
const populationDataSchema = z.object({
  label: z.enum(ALL_LABELS),
  data: z.array(populationMonoDataSchema),
});
const populationCompositionPerYearSchema = z.object({
  boundaryYear: z.number(),
  data: z.array(populationDataSchema),
});
export type PopulationCompositionPerYear = z.infer<typeof populationCompositionPerYearSchema>;

const populationCompositionPerYearResponseSchema = z.object({
  message: z.string().nullable(),
  result: populationCompositionPerYearSchema,
});
export type PopulationCompositionPerYearResponse = z.infer<typeof populationCompositionPerYearResponseSchema>;

/**
 * zodのsafeParse用に，JSON.parseでエラーを出さないための関数
 * @param {string} data JSON.parseするデータ
 * @returns parseできた場合は，JSON Object．できなかった場合は空Object{}
 */
const jsonSafeParse = (data: string): object => {
  try {
    const json = JSON.parse(data);
    return json;
  } catch (_) {
    return {};
  }
};

/**
 * prefectures一覧をfetchする
 * @returns {Promise<z.SafeParseReturnType<PrefecturesResponse,PrefecturesResponse>>} ResponseのzodでsafeParseしたResult
 */
export async function fetchPrefectures(): Promise<z.SafeParseReturnType<PrefecturesResponse, PrefecturesResponse>> {
  const url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures";
  // fetchがthrow Errorを起こしうるので囲む
  // ErrorはzodのsafeParseに吸収させる
  const res = await fetch(url, {
    headers: {
      // eslint-disable-next-line
      "X-API-KEY": import.meta.env.VITE_X_API_KEY,
    },
  });
  const text = await res.text();
  const json = jsonSafeParse(text);
  const result = prefectureResponseSchema.safeParse(json);
  return result;
}

/**
 * prefCodeの人口をfetchする
 * @param {number} prefCode PrefectureのprefCode属性
 * @returns {Promise<z.SafeParseReturnType<PopulationCompositionPerYearResponse,PopulationCompositionPerYearResponse>>} Responseのjson生データ
 */
export type FetchPopulationReturnType = Promise<
  z.SafeParseReturnType<PopulationCompositionPerYearResponse, PopulationCompositionPerYearResponse>
>;
export async function fetchPopulation(prefCode: number): FetchPopulationReturnType {
  const baseUrl = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear";
  const url = `${baseUrl}?prefCode=${prefCode}`;
  // fetchがthrow Errorを起こしうるので囲む
  // ErrorはzodのsafeParseに吸収させる
  let text;
  try {
    const res = await fetch(url, {
      headers: {
        // eslint-disable-next-line
        "X-API-KEY": import.meta.env.VITE_X_API_KEY,
      },
      // * 出生データという特徴から，更新されにくいためBrowserのcacheに任せる．
      cache: "default",
    });
    text = await res.text();
  } catch (e) {
    text = "";
  }
  const json = jsonSafeParse(text);
  const result = populationCompositionPerYearResponseSchema.safeParse(json);
  return result;
}
