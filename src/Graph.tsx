import Highcharts from "highcharts";
import type {SeriesLineOptions} from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React,{useEffect,useState, useRef} from "react";
import { fetch_population, fetch_population_return_type, label_type, PopulationCompositionPerYear, Prefecture } from "./api";

type GraphProps = {
    prefectures: Prefecture[],
    label: label_type
};


/**
 * fetch_populationのResponseから，PlotさせるDataを生成する関数
 * @param {string} name plotするデータの名前
 * @param {PopulationCompositionPerYear} population fetch_populationからfetchしたデータ
 * @param {string} label fetchしたデータの中で使用するラベル
 * @returns {SeriesLineOptions} Highchartsのseries用
 */
// 
function population_to_plot_data(name:string,population:PopulationCompositionPerYear,label:string):SeriesLineOptions{
    const plot_data:SeriesLineOptions = {type:"line"};
    const data = population.data;
    const selected_data = data.filter((d) => d.label === label);
    //! エラー処理
    if(selected_data.length < 1){
        console.log("ERROR");
    }
    plot_data.name = name;
    plot_data.data = selected_data[0].data.map(d => [d.year,d.value]);
    return plot_data;
}

/**
 * 一度に非同期でPrefectureから，Highchartsのseriesを生成する関数
 * @param {Prefecture[]} prefectures CheckされたPrefectures
 * @param {label_type} label Plotに使用するデータのラベル
 * @returns {Promise<SeriesLineOptions[]>} 非同期のHighchartsのseriesデータ
 */
// 
const prefectures_to_series = async(prefectures:Prefecture[],label:label_type) => {
    const promises:fetch_population_return_type[] = [];
    prefectures.forEach(pref => {
        const promise = fetch_population(pref.prefCode);
        promises.push(promise);
    });
    const populations = await Promise.all(promises);
    const series:SeriesLineOptions[] = [];
    //! 次ここから
    populations.forEach((res,index) => {
        if(!res.success){
            // !fetch error
            return;
        }
        const population = res.data;
        const result = population.result;
        const pref = prefectures[index];
        series.push(population_to_plot_data(pref.prefName,result,label));
    });
    return series;
}

const Graph:React.FC<GraphProps> = ({prefectures,label}:GraphProps) => {
    // plotするseries
    const [series,set_series] = useState<SeriesLineOptions[]>([]);
    useEffect(() => {
        (async () => {
            const series = await prefectures_to_series(prefectures,label);
            set_series(series);
        })();
    },[prefectures,label]);

    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    const options: Highcharts.Options = {
        title: {
            text: `${label}`
        },
        yAxis:{
            title:{
                text: "人口数"
            }
        }, 
        xAxis:{
            title:{
                text: "年度"
            }
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
        </div>
    )
}

export default Graph;