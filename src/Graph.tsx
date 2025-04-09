import Highcharts from "highcharts";
import type {SeriesLineOptions} from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React,{useEffect,useState, useRef} from "react";
import { fetch_population, PopulationCompositionPerYear, PopulationCompositionPerYearResponse, Prefecture } from "./api";

type GraphProps = {
    prefectures: Prefecture[]
};


function population_to_plot_data(name:string,population:PopulationCompositionPerYear,label:string):SeriesLineOptions{
    const plot_data:SeriesLineOptions = {};
    const data = population.data;
    const selected_data = data.filter((d) => d.label === label);
    //! エラー処理
    if(selected_data.length < 1){ }
    plot_data.name = name;
    plot_data.type = "line";
    plot_data.data = selected_data[0].data.map(d => [d.year,d.value]);
    return plot_data;
}

const prefectures_to_series = async(prefectures:Prefecture[]) => {
    const promises:Promise<PopulationCompositionPerYearResponse>[] = [];
    prefectures.forEach(pref => {
        const promise = fetch_population(pref.prefCode);
        promises.push(promise);
    });
    const populations = await Promise.all(promises);
    //! ここのCache化が必要
    const series:SeriesLineOptions[] = [];
    populations.forEach((population,index) => {
        const result = population.result;
        const pref = prefectures[index];
        series.push(population_to_plot_data(pref.prefName,result,"年少人口"));
    });
    return series;
}

const Graph:React.FC<GraphProps> = ({prefectures}:GraphProps) => {
    const [series,set_series] = useState<SeriesLineOptions[]>([]);
    useEffect(() => {
        (async () => {
            const series = await prefectures_to_series(prefectures);
            set_series(series);
        })();
    },[prefectures]);
    // useEffect(() => {
    //     prefectures.forEach(pref => {
    //         fetch_population(pref.prefCode).then(json => {
    //             const res = json.result;
    //             console.log(res);
    //             series.push(population_to_plot_data(pref.prefName,res,"年少人口"));
    //     })});
    // },[prefectures,series]);

    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    console.log(series);
    const options: Highcharts.Options = {
        title: {
            text: "テストだよ"
        },
        series: series
    };
    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartComponentRef}
            />
            {/* {perfCodes} */}
        </div>
    )
}

export default Graph;