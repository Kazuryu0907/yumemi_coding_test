import { useEffect, useState } from "react";
import { ALL_LABELS, fetchPrefectures, LabelType, Prefecture } from "./api";
import { ErrorFallBack, ErrorHandleType } from "./components/Error";
import Graph from "./Graph";
/**
 * 単一のCheckboxコンポーネント
 * @param {Prefecture} pref 表示させるチェックボックスに対応するPrefecture
 * @param {React.ChangeEventHandler<HTMLInputElement>} onChange チェックボックスが変化した時に，親コンポーネントのStateを更新するための関数
 * @returns {JSX.Element} JSX.Element
 */
function Checkbox(pref: Prefecture, onChange: React.ChangeEventHandler<HTMLInputElement>) {
  const id = `checkbox-${pref.prefName}`;
  let label = pref.prefName;
  // 文字数を揃えるため，4文字未満はblank追加
  // 漢字しか入ってこないので，サロゲートペアは考慮しない
  if (label.length < 4) {
    const nBlank = 4 - label.length;
    label = `${label}${"　".repeat(nBlank)}`;
  }
  return (
    <div className="flex items-center">
      <input
        id={id}
        onChange={onChange}
        type="checkbox"
        className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label htmlFor={id} className="ms-2 text-base font-medium text-gray-900 dark:text-gray-300">{label}</label>
    </div>
  );
}

/**
 * CheckboxのonChange関数を生成する
 * @param {Prefecture} pref 対応するPrefecture
 * @param {React.Dispatch<React.SetStateAction<CheckedPrefectureIdsType>>} setCheckedPrefectureIds 親コンポーネントのStateを更新する関数
 * @returns {React.ChangeEventHandler<HTMLInputElement>} onChange関数
 */

function createCheckboxOnChange(
  pref: Prefecture,
  setCheckedPrefectureIds: React.Dispatch<React.SetStateAction<CheckedPrefectureIdsType>>,
) {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCheckedPrefectureIds((prev) => {
      prev.set(pref, e.target.checked);
      // 新しいObjectにしてState更新させる
      return new Map(prev);
    });
  };
  return onChange;
}

/**
 * 4行に整列されたCheckboxをRenderするコンポーネント
 * @param {Prefecture[]} prefectures Prefectureの配列
 * @param {React.Dispatch<React.SetStateAction<CheckedPrefectureIdsType>>} setCheckedPrefectureIds 子コンポーネントに流す，CheckboxのState更新用関数
 * @returns {JSX.Element} JSX.Element
 */
function AlignedCheckbox(
  prefectures: Prefecture[],
  setCheckedPrefectureIds: React.Dispatch<React.SetStateAction<CheckedPrefectureIdsType>>,
) {
  const boxes = prefectures.map((pref) => {
    return (
      <div className="mx-auto" key={pref.prefName}>
        {Checkbox(pref, createCheckboxOnChange(pref, setCheckedPrefectureIds))}
      </div>
    );
  });

  return (
    <div>
      <div className="flex">
        <a className="text-center px-2 mx-auto border rounded-sm border-black my-auto">都道府県</a>
      </div>
      <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 2xl:grid-cols-7">
        {boxes}
      </div>
    </div>
  );
}

/**
 * Labelを変更するSelectボタン
 * @param {LabelType} label labelのState
 * @param {React.Dispatch<React.SetStateAction<LabelType>>} set_label labelのStateのset関数
 * @returns {JSX.Element}
 */
function LabelSelect(
  { label, setLabel }: { label: LabelType; setLabel: React.Dispatch<React.SetStateAction<LabelType>> },
) {
  return (
    <form className="max-w-sm mx-auto">
      <select
        id="labels"
        className="bg-gray-50 text-center  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        onChange={(e) => setLabel(e.target.value as LabelType)}
        defaultValue={label}
      >
        {ALL_LABELS.map(label => {
          return <option key={label}>{label}</option>;
        })}
      </select>
    </form>
  );
}

type CheckedPrefectureIdsType = Map<Prefecture, boolean>;
function Yumemi() {
  // fetchしたprefecture一覧を格納
  const [prefectures, set_prefectures] = useState<Prefecture[]>([]);
  const [label, set_label] = useState<LabelType>("総人口");
  // {prefecture_id[0]: is_checked[0],...}の繰り返し
  const [checked_prefecture_ids, set_checked_prefecture_ids] = useState<CheckedPrefectureIdsType>(new Map());
  const [error, set_error] = useState<ErrorHandleType>({ isError: false, message: "" });
  // 初回のみ実行
  useEffect(() => {
    // ゆめみのAPIを叩き，prefecture一覧取得
    fetchPrefectures().then(res => {
      if (!res.success) {
        // fetch Err
        console.error(res.error);
        set_error({ isError: true, message: "prefectures fetch error" });
        return;
      }
      const pref = res.data;
      // Stateのprefecture更新
      set_prefectures(pref.result);
      const checked_pref_ids: CheckedPrefectureIdsType = new Map();
      // Stateのchecked_prefecture_ids更新
      pref.result.map((pref) => {
        checked_pref_ids.set(pref, false);
      });
      set_checked_prefecture_ids(checked_pref_ids);
    });
  }, []);

  // checkされたid:{number}だけ取り出す
  const checked_prefecture_ids_: Prefecture[] = [];
  checked_prefecture_ids.forEach((is_checked, pre) => {
    if (is_checked) checked_prefecture_ids_.push(pre);
  });

  return (
    <div className="mt-3">
      <h1 className="text-center font-bold text-xl">ゆめみ Coding Test</h1>
      {/* {error.is_error ? <ErrorFallBack error={error.message}/> : <NormalComponent/>}  */}
      {/* <NormalComponent></NormalComponent> */}
      {error.isError && <ErrorFallBack error={error.message} />}
      {!error.isError && (
        <div className="mt-5">
          {AlignedCheckbox(prefectures, set_checked_prefecture_ids)}
          <div className="mt-3 flex items-center h-auto">
            <LabelSelect label={label} setLabel={set_label} />
          </div>
          <Graph prefectures={checked_prefecture_ids_} label={label} />
        </div>
      )}
    </div>
  );
}

export default Yumemi;
