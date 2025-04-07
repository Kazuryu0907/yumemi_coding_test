import { useEffect, useState } from "react";
import { fetch_prefectures,Prefecture } from "./api";

function Checkbox(pref:Prefecture, onChange:React.ChangeEventHandler<HTMLInputElement>){
    const id = `checkbox-${pref.prefName}`;
    let label = pref.prefName;
    // 文字数を揃えるため，4文字未満はblank追加
    // 漢字しか入ってこないので，サロゲートペアは考慮しない
    if(label.length < 4){
        const n_blank = 4 - label.length;
        label = `${label}${"　".repeat(n_blank)}`;
    }
    return(
        <div className="flex items-center">
            <input id={id} onChange={onChange} type="checkbox" className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" /> 
            <label htmlFor={id} className="ms-2 text-base font-medium text-gray-900 dark:text-gray-300">{label}</label>
        </div>
    )
}

function create_checkbox_onChange(pref:Prefecture,set_checked_prefecture_ids:React.Dispatch<React.SetStateAction<checked_prefecture_ids_type>>){
    const onChange:React.ChangeEventHandler<HTMLInputElement> = (e) => {
        set_checked_prefecture_ids((prev) => {
            prev[pref.prefCode] = e.target.checked;
            return {...prev};
        }
        );
    }
    return onChange;
}

function AlignedCheckbox(prefectures:Prefecture[],set_checked_prefecture_ids:React.Dispatch<React.SetStateAction<checked_prefecture_ids_type>>){
    const split_prefectures:Prefecture[][] = [[]];
    for(let i = 0;i < prefectures.length;i++){
        // 4つごとに分割
        const index = i % 4;
        if(index == 0){
            split_prefectures.push([]);
        }
        const j = Math.floor(i / 4);
        split_prefectures[j][index] = prefectures[i];
    }

    const split_check_boxes = split_prefectures.map((check_boxes,i) => {
        return(
            <div key={`checkbox-group-${i}`} onChange={() => console.log("changed")}>
                <div className="flex">
                    {check_boxes.map(pref => {
                        return(
                            <div className="mx-3" key={pref.prefName}>
                                {Checkbox(pref,create_checkbox_onChange(pref,set_checked_prefecture_ids))}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    })
    return(
        <div className="">
            {split_check_boxes}
        </div>
    )
}

type checked_prefecture_ids_type = Record<number,boolean>;
function Yumemi(){
    const [prefectures,set_prefectures] = useState<Prefecture[]>([]);
    const [checked_prefecture_ids,set_checked_prefecture_ids] = useState<checked_prefecture_ids_type>({});
    useEffect(() => {
        fetch_prefectures().then(json => {
            set_prefectures(json.result);
            const checked_pref_ids:checked_prefecture_ids_type = {};
            json.result.map((pref) => {
                checked_pref_ids[pref.prefCode] = false;
            });
            set_checked_prefecture_ids(checked_pref_ids);
        });
    },[]);
    return(
        <div className="mt-10 px-16">
            <div>
                <a className="border border-black">都道府県</a>
            </div>
            Hello!
            {AlignedCheckbox(prefectures,set_checked_prefecture_ids)}
        </div>
    )
}

export default Yumemi;