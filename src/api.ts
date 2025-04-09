export type Prefecture = {
    prefCode: number,
    prefName: string
};

export type PrefecturesResponse = {
    message: string,
    result: Prefecture[]
};


export const ALL_LABELS = ["総人口","年少人口","生産年齢人口","老年人口"] as const;
export type label_tuple = typeof ALL_LABELS;
export type label_type = label_tuple[number];
export type PopulationCompositionPerYear = {
    boundaryYear: number,
    data: {
        label:label_type,
        data: {
            year:number,
            value: number,
            rate: number
        }[]
    }[]
};

export type PopulationCompositionPerYearResponse = {
    message: string,
    result: PopulationCompositionPerYear
};


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