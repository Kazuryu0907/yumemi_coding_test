import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import React,{useRef} from "react";

type GraphProps = {
    perfCodes: number[]
};
const Graph:React.FC<GraphProps> = ({perfCodes}:GraphProps) => {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
    const options: Highcharts.Options = {
        title: {
            text: "テストだよ"
        },
        series: [
            {
                type: "line",
                data: [1,2,3]
            }
        ]
    };
    return (
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartComponentRef}
            />
            {perfCodes}
        </div>
    )
}

export default Graph;