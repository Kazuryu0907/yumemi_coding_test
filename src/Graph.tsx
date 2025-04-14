import Highcharts from "highcharts";
import type { SeriesLineOptions } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React, { useEffect, useRef, useState } from "react";
import { fetchPopulation, FetchPopulationReturnType, LabelType, PopulationCompositionPerYear, Prefecture } from "./api";
import { ErrorFallBack, ErrorHandleType } from "./components/Error";

type GraphProps = {
  prefectures: Prefecture[];
  label: LabelType;
};

/**
 * fetch_populationのResponseから，PlotさせるDataを生成する関数
 * @param {string} name plotするデータの名前
 * @param {PopulationCompositionPerYear} population fetch_populationからfetchしたデータ
 * @param {string} label fetchしたデータの中で使用するラベル
 * @returns {SeriesLineOptions} Highchartsのseries用
 */
//
function populationToPlotData(
  name: string,
  population: PopulationCompositionPerYear,
  label: string,
): SeriesLineOptions {
  const plotData: SeriesLineOptions = { type: "line" };
  const data = population.data;
  const selectedData = data.filter((d) => d.label === label);
  // ! エラー処理
  if (selectedData.length < 1) {
    console.log("ERROR");
  }
  plotData.name = name;
  plotData.data = selectedData[0].data.map(d => [d.year, d.value]);
  return plotData;
}

/**
 * 一度に非同期でPrefectureから，Highchartsのseriesを生成する関数
 * @param {Prefecture[]} prefectures CheckされたPrefectures
 * @param {LabelType} label Plotに使用するデータのラベル
 * @returns {Promise<SeriesLineOptions[]>} 非同期のHighchartsのseriesデータ
 */
//
const prefecturesToSeries = async (
  prefectures: Prefecture[],
  label: LabelType,
  setError: React.Dispatch<React.SetStateAction<ErrorHandleType>>,
) => {
  const promises: FetchPopulationReturnType[] = [];
  prefectures.forEach(pref => {
    const promise = fetchPopulation(pref.prefCode);
    promises.push(promise);
  });
  const populations = await Promise.all(promises);
  const series: SeriesLineOptions[] = [];
  populations.forEach((res, index) => {
    if (!res.success) {
      // fetch error
      setError({ isError: true, message: "population fetch error" });
      return;
    }
    const population = res.data;
    const result = population.result;
    const pref = prefectures[index];
    series.push(populationToPlotData(pref.prefName, result, label));
  });
  return series;
};

const Graph: React.FC<GraphProps> = ({ prefectures, label }: GraphProps) => {
  // plotするseries
  const [series, setSeries] = useState<SeriesLineOptions[]>([]);
  const [error, setError] = useState<ErrorHandleType>({ isError: false, message: "" });
  useEffect(() => {
    (async () => {
      const series = await prefecturesToSeries(prefectures, label, setError);
      setSeries(series);
    })();
  }, [prefectures, label]);

  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const options: Highcharts.Options = {
    title: {
      text: `${label}`,
    },
    yAxis: {
      title: {
        text: "人口数",
      },
    },
    xAxis: {
      title: {
        text: "年度",
      },
    },
    series: series,
  };
  return (
    <div data-testid={"graph"}>
      {error.isError && <ErrorFallBack error={error.message} />}
      {!error.isError && (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          ref={chartComponentRef}
        />
      )}
    </div>
  );
};

export default Graph;
