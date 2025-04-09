import { useEffect, useState } from "react";
import { fetch_population, fetch_prefectures,Prefecture } from "./api";
import Graph from "./Graph";
/**
 * 単一のCheckboxコンポーネント
 * @property {Prefecture} pref 表示させるチェックボックスに対応するPrefecture
 * @property {React.ChangeEventHandler<HTMLInputElement>} onChange チェックボックスが変化した時に，親コンポーネントのStateを更新するための関数
 * @returns {JSX.Element} JSX.Element
 */
// 
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

/**
 * CheckboxのonChange関数を生成する
 * @param {Prefecture} pref 対応するPrefecture
 * @param {React.Dispatch<React.SetStateAction<checked_prefecture_ids_type>>} set_checked_prefecture_ids 親コンポーネントのStateを更新する関数
 * @returns {React.ChangeEventHandler<HTMLInputElement>} onChange関数
 */

function create_checkbox_onChange(pref:Prefecture,set_checked_prefecture_ids:React.Dispatch<React.SetStateAction<checked_prefecture_ids_type>>){
    const onChange:React.ChangeEventHandler<HTMLInputElement> = (e) => {
        set_checked_prefecture_ids((prev) => {
            prev.set(pref,e.target.checked);
            // 新しいObjectにしてState更新させる
            return new Map(prev);
        }
        );
    }
    return onChange;
}

/**
 * 4行に整列されたCheckboxをRenderするコンポーネント
 * @param {Prefecture[]} prefectures Prefectureの配列
 * @param {React.Dispatch<React.SetStateAction<checked_prefecture_ids_type>>} set_checked_prefecture_ids 子コンポーネントに流す，CheckboxのState更新用関数
 * @returns {JSX.Element} JSX.Element
 */
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
            <div key={`checkbox-group-${i}`}>
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

// * RecordからMapに変更
type checked_prefecture_ids_type = Map<Prefecture,boolean>;
function Yumemi(){
    const [prefectures,set_prefectures] = useState<Prefecture[]>([]);
    const [checked_prefecture_ids,set_checked_prefecture_ids] = useState<checked_prefecture_ids_type>(new Map());
    // 初回のみ実行
    useEffect(() => {
        // ゆめみのAPIを叩き，prefecture一覧取得
        fetch_prefectures().then(json => {
            // Stateのprefecture更新
            set_prefectures(json.result);
            const checked_pref_ids:checked_prefecture_ids_type = new Map();
            // Stateのchecked_prefecture_ids更新
            json.result.map((pref) => {
                checked_pref_ids.set(pref,false);
            });
            console.log(checked_pref_ids);
            set_checked_prefecture_ids(checked_pref_ids);
        });
    },[]);


    // checkboxが更新された時発火
    useEffect(() => {
        const checked_prefectures:Prefecture[] = [];
        for(const [pref,is_checked] of checked_prefecture_ids){
            if(is_checked === true)checked_prefectures.push(pref);
        }
        if(checked_prefectures.length === 0)return;
        fetch_population(checked_prefectures[0].prefCode).then(json => {
            console.log(json.result);
            // ここのデータをGraph.tsxに流す
        });
    },[checked_prefecture_ids]);

    // checkされたid:numberだけ取り出す
    const checked_prefecture_ids_:number[] = [];
    checked_prefecture_ids.forEach((is_checked,pre) => {if(is_checked)checked_prefecture_ids_.push(pre.prefCode)});
    return(
        <div className="mt-10 px-16">
            <div>
                <a className="border border-black">都道府県</a>
            </div>
            {AlignedCheckbox(prefectures,set_checked_prefecture_ids)}
            <Graph perfCodes={checked_prefecture_ids_}/>
        </div>
    )
}

export default Yumemi;