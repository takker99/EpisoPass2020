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
import $ from "https://esm.sh/jquery@3.6.0";
import type { EpisoData } from "./types.ts";
import { make_html, show } from "./lib.ts";
import { dasmaker } from "./dasmaker.ts";
import { easy } from "./easy.ts";
import { crypt } from "./crypt.ts";

export const editor = (data: EpisoData) => {
  const {
    name,
  } = data;
  let {
    qas,
  } = data;
  let curq = 0;
  let cura = 0;

  const answer: number[] = []; // answer[q] = a ... q番目の質問の答がa番目である

  const selfunc = (q: number, a: number) =>
    // q番目の質問のa番目の選択肢をクリックしたとき呼ばれる関数
    () => {
      answer[q] = a;
      for (let i = 0; i < qas[q].answers.length; i++) {
        $(`#answer${q}-${i}`).css(
          "background-color",
          i === a ? "#555" : "#fff",
        );
        $(`#answer${q}-${i}`).css("color", i === a ? "#fff" : "#555");
      }
      return calcpass();
    };

  const editfunc = (q: number, a: number) =>
    // q番目の質問のa番目の選択肢を編集したとき呼ばれる関数
    () => {
      curq = q;
      cura = a;
      qas[q].answers[a] = $(`#answer${q}-${a}`).val() as string;
      return calcpass();
    };

  let timeout: number | undefined = undefined;
  const hover_in_func = (q: number, a: number) =>
    () => timeout = setTimeout(selfunc(q, a), 400);
  const hover_out_func = () => () => clearTimeout(timeout);

  // f4ba35ab6069e8bcf9ef62bf73d12fd1.png のような表示
  const answerspan =  (q: number, a: number)=> { // q番目の質問のa番目の選択肢のspan
    const aspan = $('<span class="answer">');
    const input = $('<input type="text" autocomplete="off" class="answer">')
      .val(qas[q].answers[a])
      .attr("id", `answer${q}-${a}`)
      .css("background-color", a === 0 ? "#555" : "#fff")
      .css("color", a === 0 ? "#fff" : "#555")
      .on("click", selfunc(q, a))
      .on("keyup", editfunc(q, a));
    // .hover hover_in_func(q,a), hover_out_func()
    return aspan.append(input);
  };

  const showimage =  (str: string, img: JQuery<any>)=> {
    if (str.match(/\.(png|jpeg|jpg|gif)$/i)) {
      return img.attr("src", str)
        .css("display", "block");
    } else {
      return img.css("display", "none");
    }
  };

  const qeditfunc = (q: number) =>
    // q番目の問題を編集したとき呼ばれる関数
    () => {
      const str = $(`#question${q}`).val() as string;
      qas[q].question = str;
      const img = $(`#image${q}`);
      showimage(str, img);
      return calcpass();
    };

  const minusfunc = (q: number) =>
    // q番目の問題の「-」ボタンを押したとき呼ばれる関数
    () => {
      qas[q].answers.pop();
      return $(`#answer${q}-${qas[q].answers.length}`).remove();
    };

  const plusfunc = (q: number) =>
    // q番目の問題の「+」ボタンを押したとき呼ばれる関数
    () => {
      const nelements = qas[q].answers.length;
      qas[q]["answers"].push("新しい回答例");
      return $(`#delim${q}`).before(answerspan(q, nelements));
    };

  const qadiv =  (q: number) =>{ // q番目の質問+選択肢のdiv
    answer[q] = 0;
    const div = $("<div class='qadiv'>") // !!!!!!!clssが変
      .attr("id", `qadiv${q}`);
    const qdiv = $('<div width="100%" class="qdiv">');
    const qstr = qas[q]["question"];
    const qinput = $('<input type="text" autocomplete="off" class="qinput">')
      .attr("id", `question${q}`)
      .val(qstr)
      .on("keyup", qeditfunc(q));
    qdiv.append(qinput);
    div.append(qdiv);

    const img = $("<img class='qimg'>")
      .attr("id", `image${q}`);
    div.append(img);
    showimage(qstr, img);

    const ansdiv = $("<div class='ansdiv'>");
    for (let i = 0; i < qas[q].answers.length; i++) {
      ansdiv.append(answerspan(q, i));
    }
    const delim = $("<span>  </span>")
      .attr("id", `delim${q}`);
    ansdiv.append(delim);

    const minus = $('<input type="button" value=" 回答削除 ">')
      .on("click", minusfunc(q));
    ansdiv.append(minus);
    ansdiv.append($("<span>  </span>"));

    const plus = $('<input type="button" value=" 回答追加 ">')
      .on("click", plusfunc(q));
    ansdiv.append(plus);
    return div.append(ansdiv)
      .append($('<br clear="all">'));
  };

  const maindiv =  () =>{
    $("#main").children().remove(); // ブラウザから「別名で保存」すると #main に入れたデータが全部格納されてしまうので、最初に全部消しておく

    for (let i = 0; i < qas.length; i++) {
      $("#main").append(qadiv(i));
    }

    const minus = $(
      '<input type="button" value=" 問題削除 " id="qa_minus" class="qabutton">',
    )
      .click( () =>{ // 質問の数を減らす「-」ボタンをクリックしたとき呼ばれる関数
        qas.pop();
        $(`#qadiv${qas.length}`).remove();
        return calcpass();
      });
    $("#main").append(minus);

    $("#main").append($("<span>  </span>"));

    const plus = $('<input type="button" value=" 問題追加 " class="qabutton">')
      .click(()=> { // 質問の数を増やす「-」ボタンをクリックしたとき呼ばれる関数
        qas.push({
          question: "新しい質問",
          answers: ["回答11", "回答22", "回答33"],
        });
        $("#qa_minus").before(qadiv(qas.length - 1));
        return calcpass();
      });
    return $("#main").append(plus);
  };

  const secretstr = () =>
    // 質問文字列と選択された文字列をすべて接続した文字列
    qas.map((qa, i) => qa.question + qa.answers[answer[i]]).join("");

  const calcpass = () => { // シード文字列からパスワード文字列を生成
    const newpass = crypt($("#seed").val() as string, secretstr());
    return $("#pass").val(newpass);
  };

  const calcseed = () => { // パスワード文字列からシード文字列を生成
    const newseed = crypt($("#pass").val() as string, secretstr());
    $("#seed").val(newseed);
    return data["seed"] = newseed;
  };

  const sendfile = (files) => {
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.onload =  (event)=> {
      const s = event.target.result; // 読んだファイルの内容
      if (s[0] === "{") {
        data = JSON.parse(s);
      } else {
        const lines = s.split(/\n/);
        lines.forEach((line) =>{
          const m = line.match(/^\s*const data = (.*)$/);
          if (m) {
            const json = m[1].replace(/;.*$/, "");
            return data = JSON.parse(json);
          }
        });
      }
      qas = data["qas"];
      const seed = data["seed"];
      $("#seed").val(seed);
      $("#main").children().remove();
      maindiv();
      return calcpass();
    };
    fileReader.readAsText(file);
    return false;
  };

  const init =  () =>{
    show("#editor");
    make_html(data);

    //
    // seedかパスワードを編集したら相手を変更
    //
    $("#seed").keyup(() => {
      data.seed = $("#seed").val() as string;
      return calcpass();
    });
    $("#pass").keyup(() => calcseed());

    $("#descbutton").click(() => show("#description"));

    $("#editbutton").click(() => show("#editor"));

    $("#dasbutton").off(); // 何度も登録されて困った
    $("#dasbutton").click(() => dasmaker(data, answer));

    $("#easybutton").click(() => easy());

    $("#seed").val(data.seed);

    // Drag&Drop対応
    $("body")
      .bind("dragover", () => false).bind("dragend", () => false).bind(
        "drop",
         (e) =>{
          e.preventDefault(); // デフォルトは「ファイルを開く」
          const {
            files,
          } = e.originalEvent.dataTransfer;
          sendfile(files);
          return files;
        },
      );

    //
    // backボタンで戻ったときなど再表示する
    //
    //$(window).on 'pageshow', ->
    //  maindiv()

    maindiv();
    return calcpass();
  };

  return init();
};
