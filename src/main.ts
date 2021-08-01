//
// EpisoPassの入口
//
import { editor } from "./editor.ts";
import { sampleData } from "./sampledata.ts";

let data = sampleData;
let questions: string[] = data.qas.map((qa) => qa.question);
let answers: string[] = data.qas[0].answers;
// 引数解釈
if (location.search !== "") {
  const params = new URLSearchParams(location.search.slice(1));
  if (params.has("questions")) {
    questions = decodeURIComponent(params.get("questions")!).split(
      /;/,
    );
  }
  if (params.has("answers")) {
    answers = decodeURIComponent(params.get("answers")!).split(
      /;/,
    );
  }
  data = {
    name: "EpisoPass",
    seed: "EpisoPassSeed01234",
    qas: questions.map((question) => ({ question, answers })),
  };
}

editor(data);
