//
// EpisoPassの入口
//
import { editor } from "./editor.ts";
import { sampleData } from "./sampledata.ts";

let data = sampleData;
let questions: string[] = data.qas.map((qa) => qa.question);
let answers: string[] = data.qas[0].answers;

if (location.search[0] == "?") { // 引数解釈
  const pairs = location.search.substring(1).split("&");
  for (const pair of pairs) {
    const kv = pair.split("=");
    if (kv[0] == "questions") {
      questions = decodeURIComponent(kv[1]).split(/;/);
    }
    if (kv[0] == "answers") {
      answers = decodeURIComponent(kv[1]).split(/;/);
    }
  }
  data = {
    name: "EpisoPass",
    seed: "EpisoPassSeed01234",
    qas: questions.map((question) => ({ question, answers })),
  };
}

editor(data);
