import $ from "https://esm.sh/jquery@3.6.0";
import { show } from "./lib.ts";

export function easy() {
  show("#easy");

  $("body").on("click", () => {
    $("#easyanswers").css("height", "80px");
    $("#easyquestions").css("height", "80px");
  });
  $("#easyanswers").on("click", () => {
    $("#easyanswers").css("height", "300px");
    $("#easyquestions").css("height", "80px");
    return false;
  });
  $("#easyquestions").on("click", () => {
    $("#easyquestions").css("height", "300px");
  });
  $("#easyquestions").on("click", () => {
    $("#easyquestions").css("height", "300px");
    $("#easyanswers").css("height", "80px");
    return false;
  });
  $("#startedit").click(function () {
    const answers = $.grep(
      ($("#easyanswers")!.val() as string).split(/\n+/),
      (s) => s !== "",
    );
    if (answers.length == 0) {
      alert("名前リストを入力して下さい");
      return;
    }
    const qs = $.grep(
      ($("#easyquestions")!.val() as string).split(/\n+/),
      (s) => s !== "",
    );
    if (qs.length == 0) {
      alert("質問リストを入力して下さい");
      return;
    }

    const qas = qs.map((question) => ({ question, answers }));
    const data = { seed: "SampleSeed12345", qas, name: "easy" };

    editor.editor(data);
  });

  const pair = location.search.substring(1).split("&");
  for (let i = 0; pair[i]; i++) {
    const kv = pair[i].split("=");
    if (kv[0] == "questions") {
      $("#easyquestions").val(
        decodeURIComponent(kv[1]).split(/;/).join("\n"),
      );
    }
    if (kv[0] == "answers") {
      $("#easyanswers").val(decodeURIComponent(kv[1]).split(/;/).join("\n"));
    }
  }
}
