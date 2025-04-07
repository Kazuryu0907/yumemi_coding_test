export type Prefecture = {
    prefCode: number,
    prefName: string
};

export type PrefecturesResponse = {
    message: string,
    result: Prefecture[]
};


export type PopulationCompositionPerYear = {
    boundaryYear: number,
    data: {
        label:string,
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

export async function fetch_population(prefCode: number){
    const base_url = "https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/population/composition/perYear";
    const url = `${base_url}?prefCode=${prefCode}`
    const res = await fetch(url,{
        headers: {
            "X-API-KEY": "8FzX5qLmN3wRtKjH7vCyP9bGdEaU4sYpT6cMfZnJ",
        }
    });
    const text = await res.text();
    const json:PopulationCompositionPerYearResponse = JSON.parse(text);
    console.log(json.result);
}