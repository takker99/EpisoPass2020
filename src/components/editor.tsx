/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
//  editor.coffee - EpisoPass問題編集画面
//
//  Toshiyuki Masui @ Pitecan.com
//  Modified       2015/10/31 19:12:53
//  Modified       2018/02/23 17:24:33 for heroku
//  Modified       2019/12/23 サーバを使わないように修正
//
/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

/** @jsx h */
import { h } from "https://esm.sh/preact@10.5.14";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "https://esm.sh/preact@10.5.14/hooks";
import { EpisoData } from "../types.ts";
import { Password } from "./Password.tsx";
import { Answer } from "./Answer.tsx";

function useEpisoData(data: EpisoData) {
  const [qas, setQas] = useState(data.qas);
  const [/** 選択している回答の番号を格納する変数 */ selectedIndice, setSelectedIndice] =
    useState<number[]>(
      Array(data.qas.length),
    );

  // `qas`が変化するたびに、選択中の回答の番号を修正する
  // なるべく元の回答番号を保持するようにしている
  // 新しい問題が追加されたときは、一番前の回答を選ぶようにする
  // 回答数が0のときも選択されてしまうことに注意
  useEffect(() =>
    setSelectedIndice((indice) => {
      return [...Array(qas.length).keys()].map((i) =>
        Math.min(indice[i] ?? 0, qas[i].answers.length)
      );
    }), [qas]);

  /** 特定の回答を選択する */
  const select = useCallback(
    (quesitonIndex: number, answerIndex: number) =>
      setSelectedIndice((indice) => {
        const index = indice[quesitonIndex];
        if (index === undefined) throw new RangeError("out of range");
        indice[quesitonIndex] = answerIndex;

        return indice;
      }),
    [],
  );
  /** 特定の回答を編集する */
  const changeAnswer = useCallback(
    (quesitonIndex: number, answerIndex: number, answer: string) =>
      setQas((_qas) => {
        if (_qas[quesitonIndex].answers[answerIndex] === undefined) {
          throw new RangeError();
        }
        _qas[quesitonIndex].answers[answerIndex] = answer;
        return _qas;
      }),
    [],
  );
  /** 回答の追加 */
  const push = useCallback((index: number) =>
    setQas((_qas) => {
      if (_qas[index] === undefined) throw new RangeError();
      _qas[index].answers.push("新しい回答例");
      return _qas;
    }), []);
  /** 回答の削除 */
  const pop = useCallback((index: number) =>
    setQas((_qas) => {
      if (_qas[index] === undefined) throw new RangeError();
      _qas[index].answers = qas[index].answers.slice(0, -1);
      return _qas;
    }), []);

  /** 質問文字列と選択された文字列をすべて接続した文字列 */
  const secretString = useMemo(
    () =>
      data.qas.map(({ question, answers }, i) =>
        `${question}${answers[selectedIndice[i]]}`
      ).join(""),
    [qas, selectedIndice],
  );

  // `data`の更新を反映する
  useEffect(() => setQas(data.qas), [data.qas]);

  return {
    name: data.name,
    qas: data.qas.map(({ question, answers }, i) => ({
      question,
      answers: answers.map((answer, j) => ({
        text: answer,
        select: () => select(i, j),
        change: (text: string) => changeAnswer(i, j, text),
      })),
      push: () => push(i),
      pop: () => pop(i),
      selectedIndex: selectedIndice[i],
    })),
    secretString,
  } as const;
}

export type EditorProps = {
  data: EpisoData;
  onSeedChange: (seed: string) => void;
};
export const editor = ({ data, onSeedChange }: EditorProps) => {
  const { qas, secretString } = useEpisoData(data);

  return (
    <div id="editor">
      <h2>問題編集</h2>
      <h2>
        <Password
          seed={data.seed}
          secretString={secretString}
          onSeedChange={onSeedChange}
        />
        <div id="main">
          {qas.map(({ question, answers, push, pop }) => (
            <div class="qadiv">
              <div class="qdiv" width="100%">
                <input
                  class="qinput"
                  type="text"
                  autocomplete="off"
                  value={question}
                />
              </div>
              <img class="qimg" />
              <div class="ansdiv">
                {answers.map((answer) =>
                  (
                    <Answer
                      text={answer.text}
                      onSelect={answer.select}
                      onTextChange={answer.change}
                    />
                  )
                )}
                <span>{" "}</span>
                <input type="button" value=" 回答削除" onClick={pop} />
                <span>{" "}</span>
                <input type="button" value=" 回答追加 " onClick={push} />
              </div>
              <br />
            </div>
          ))}
          <input id="qa_minus" class="qabutton" type="button" value=" 問題削除  " />
          <span>{" "}</span>
          <input id="qa_plus" class="qabutton" type="button" value=" 問題削除" />
        </div>
      </h2>
    </div>
  );
};
