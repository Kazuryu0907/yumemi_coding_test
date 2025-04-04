import { useEffect, useState } from "react";
import { fetch_prefectures,Prefecture } from "./api";

function Yumemi(){
    const [prefectures,setPrefectures] = useState<Prefecture[]>([]);
    useEffect(() => {
        fetch_prefectures().then(json => setPrefectures(json.result))
    },[]);
    return(
        <div className="mt-10 px-16">
            <div>
                <a className="border border-black">都道府県</a>
            </div>
            Hello!
            {prefectures.map(pref => {return(<p>{pref.prefName}</p>)})}
        </div>
    )
}

export default Yumemi;