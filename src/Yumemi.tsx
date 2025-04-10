import { useEffect, useState } from "react";
import { fetch_prefectures,label_type,Prefecture, ALL_LABELS } from "./api";
import Graph from "./Graph";
/**
 * 単一のCheckboxコンポーネント
 * @param {Prefecture} pref 表示させるチェックボックスに対応するPrefecture
 * @param {React.ChangeEventHandler<HTMLInputElement>} onChange チェックボックスが変化した時に，親コンポーネントのStateを更新するための関数
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
        <div>
            {split_check_boxes}
        </div>
    )
}

/**
 * Labelを変更するSelectボタン
 * @param {label_type} label labelのState
 * @param {React.Dispatch<React.SetStateAction<label_type>>} set_label labelのStateのset関数
 * @returns {JSX.Element}
 */
function LabelSelect({label,set_label}:{label:label_type,set_label:React.Dispatch<React.SetStateAction<label_type>>}){
    return(
        <form className="max-w-sm mx-auto">
            <select id="labels" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5" onChange={(e) => set_label(e.target.value as label_type)} defaultValue={label}>
            {ALL_LABELS.map(label => {
                return(<option key={label}>{label}</option>)
            })}
            </select>
        </form>
    )
}

type checked_prefecture_ids_type = Map<Prefecture,boolean>;
function Yumemi(){
    // fetchしたprefecture一覧を格納
    const [prefectures,set_prefectures] = useState<Prefecture[]>([]);
    const [label,set_label] = useState<label_type>('総人口');
    // {prefecture_id[0]: is_checked[0],...}の繰り返し
    const [checked_prefecture_ids,set_checked_prefecture_ids] = useState<checked_prefecture_ids_type>(new Map());
    // 初回のみ実行
    useEffect(() => {
        // ゆめみのAPIを叩き，prefecture一覧取得
        fetch_prefectures().then(res => {
            if(res.error){
                // fetch Err
                console.error(res.error);
                return;
            }
            const pref = res.data;
            // Stateのprefecture更新
            set_prefectures(pref.result);
            const checked_pref_ids:checked_prefecture_ids_type = new Map();
            // Stateのchecked_prefecture_ids更新
            pref.result.map((pref) => {
                checked_pref_ids.set(pref,false);
            });
            set_checked_prefecture_ids(checked_pref_ids);
        });
    },[]);

    // checkされたid:{number}だけ取り出す
    const checked_prefecture_ids_:Prefecture[] = [];
    checked_prefecture_ids.forEach((is_checked,pre) => {if(is_checked)checked_prefecture_ids_.push(pre)});

    return(
        <div className="mt-10 px-16">
            <div>
                <a className="border border-black">都道府県</a>
                <LabelSelect label={label} set_label={set_label} />
            </div>
            {AlignedCheckbox(prefectures,set_checked_prefecture_ids)}
            <Graph prefectures={checked_prefecture_ids_} label={label}/>
        </div>
    )
}

export default Yumemi;