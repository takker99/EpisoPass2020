//
// EpisoDASのDASパタンを登録
//
/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />
import { noise } from "./noiseGif.ts";
import $ from "https://esm.sh/jquery@3.6.0";
import shuffle from "https://deno.land/x/shuffle@v1.0.0/mod.ts";
import type { EpisoData } from "./types.ts";
import { make_html, show } from "./lib.ts";

export const dasmaker = (data: EpisoData, selections: number[]) => {
  var mousedown = false;
  var curdiv: JQuery<any> | null = null; // 現在選択中のdiv (letじゃ駄目)

  const selected: number[] = [];
  let finished = false; // finish() が二度呼ばれるのを防止

  var browserWidth = function () {
    if (window.innerWidth) return window.innerWidth;
    else if (document.body) return document.body.clientWidth;
    return 0;
  };

  var browserHeight = function () {
    if (window.innerHeight) return window.innerHeight;
    else if (document.body) return document.body.clientHeight;
    return 0;
  };

  function finish() { // DAS登録後の処理
    if (finished) return; // 何故か二度呼ばれることを防止
    finished = true;

    // dataを複製
    const newdata: EpisoData = {
      name: data.name,
      seed: data.seed,
      qas: data.qas.map((qa) => ({
        question: qa.question,
        answers: [...qa.answers],
      })),
    };

    // newdataの回答リストをシャフル
    for (let i = 0; i < selected.length; i++) {
      let answers = newdata["qas"][i].answers;
      const rightanswer = answers[selections[i]]; // 正答

      answers = shuffle(answers); // 答をランダムに並べかえ

      // 正答がselected[i]の位置に来るようにする
      for (let j = 0; j < answers.length; j++) {
        if (answers[j] == rightanswer) {
          /*
         このコードが何故か動ず無限ループになってしまう
         let s = selected[i]
         [answers[j], answers[s]] = [answers[s], answers[j]] // 交換
         */
          const tmp = answers[j];
          answers[j] = answers[selected[i]];
          answers[selected[i]] = tmp;
          break;
        }
      }
      newdata.qas[i].answers = answers;
    }

    //alert('DASデータを生成しました。確認して下さい。');

    make_html(newdata);
    episodas(newdata);
  }

  function initsize() {
    // width = browserWidth();
    const width = $("#contents").width() ?? 0;
    const height = browserHeight();

    // 回答を並べる。"dmid0" のようなIDになっている
    for (let i = 0; i < answers.length; i++) {
      const div = $("#dmid" + i);
      div.css("background-color", "#fff");
      div.css("width", width / 6.8);
      div.css("height", height / 10);
      div.css("font-size", width * 0.04);

      // FlexBoxでセンタリング
      div.css("display", "flex");
      div.css("justify-content", "center");
      div.css("align-items", "center");

      div.css("margin", width / 100);
      div.css("padding", width / 100);

      div.css("border-style", "solid");
      div.css("border-radius", width * 0.01);
      div.css("border-color", "#000");
      div.css("border-width", "1px");
      //div.css('box-shadow','5px 5px 4px #888');
    }
    $("#dmquestion").css("font-size", width * 0.06);
  }

  //
  // クリックイベントもドラッグイベントもmouseenter(), mouseleave()で扱う
  //
  function mouseenter(div: JQuery) {
    curdiv = div;
    if (mousedown) {
      curdiv.css("background-color", "#f3f3f3");
      curdiv.css("background-image", `url(${noise})`);
      const w = curdiv.css("width");
      const h = curdiv.css("height");
      curdiv.css("background-size", `${w} ${h}`);
      selected.push(parseInt(curdiv.attr("id")?.replace(/dmid/, "") ?? ""));
    }
  }

  function mouseleave() {
    if (mousedown) {
      curdiv?.css("background-color", "#fff");
      curdiv?.css("background-image", "");
      if (selected.length == qas.length) {
        mousedown = false;
        finish();
      }
    }
    curdiv = null;
  }

  function mousemove(e) {
    //if($('#id0')[0] == undefined) return;
    if (!mousedown) return;

    var mousex = (e.pageX ? e.pageX : e.originalEvent.touches[0].pageX);
    var mousey = (e.pageY ? e.pageY : e.originalEvent.touches[0].pageY);
    for (const i = 0; i < answers.length; i++) {
      const buttondiv = $("#dmid" + i);
      buttonx = buttondiv.offset().left;
      buttony = buttondiv.offset().top;
      buttonw = buttondiv.width();
      buttonh = buttondiv.height();
      if (
        buttonx < mousex && buttonx + buttonw > mousex &&
        buttony < mousey && buttony + buttonh > mousey
      ) {
        if (!curdiv || (curdiv.attr("id") != buttondiv.attr("id"))) {
          if (curdiv) {
            mouseleave(curdiv);
          }
          mouseenter(buttondiv);
          curdiv = buttondiv;
        }
        return;
      }
    }
    if (curdiv) {
      mouseleave(curdiv);
    }
  }

  function init() {
    show("#dasmaker");

    const qas = data.qas;

    //alert(`登録したいパタンで${qas.length}個のボタンを押すかなぞって下さい。`);

    mousedown = false;
    selected = [];

    $(window).on("resize", initsize);

    $("#dasmaker").children().remove();
    $("#dasmaker").on("mousemove", mousemove);
    $("#dasmaker").on("touchmove", mousemove);

    var center = $("<center>");
    $("#dasmaker").append(center);

    var qdiv = $("<div>");
    qdiv.text("DASパタンを入力して下さい");
    qdiv.height(100);
    qdiv.css("display", "flex");
    qdiv.css("justify-content", "center");
    qdiv.css("align-items", "center");
    qdiv.attr("id", "dmquestion");
    center.append(qdiv);

    const comment = $("<span>");
    comment.text(`${qas.length}個のボタンを押すかなぞってパタンを登録して下さい`);
    center.append(comment);

    center.append($("<p>"));

    // 回答領域
    answers = qas[0].answers; // 回答の数は同じということを仮定

    for (let i = 0; i < answers.length; i++) {
      const div = $("<div>");
      div.css("float", "left");
      div.attr("id", "dmid" + i);
      center.append(div);

      div.on("mousedown", function (e) {
        e.preventDefault();
        mousedown = true;
        curdiv = null;
        mousemove(e);
      });
      div.on("touchstart", function (e) {
        e.preventDefault();
        mousedown = true;
        curdiv = null;
        mousemove(e);
      });
      div.on("mouseup", function () {
        if (curdiv) mouseleave(curdiv);
        mousedown = false;
        curdiv = null;
      });
      div.on("touchend", function () {
        if (curdiv) mouseleave(curdiv);
        mousedown = false;
        curdiv = null;
      });
    }

    initsize();
  }

  init();
};
