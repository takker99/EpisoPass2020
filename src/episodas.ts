/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />
import { noise } from "./noiseGif.ts";
import $ from "https://esm.sh/jquery@3.6.0";
import type { EpisoData } from "./types.ts";
import { make_html } from "./lib.ts";
import { crypt } from "./crypt.ts";
import {editor}from "./editor.ts"

export const episodas = (data: EpisoData) => {
  let mousedown = false;
  var curdiv: JQuery | null = null; // letじゃ駄目
  const buttons: { x?: number; y?: number; w?: number; h?: number }[] = [];
  const selected: number[] = [];
  const qas = data.qas;

  const browserWidth = () => {
    if (window.innerWidth) return window.innerWidth;
    else if (document.body) return document.body.clientWidth;
    return 0;
  };

  const browserHeight = function () {
    if (window.innerHeight) return window.innerHeight;
    else if (document.body) return document.body.clientHeight;
    return 0;
  };

  const showQA = function () { // n番目の問題と答リストを設定
    const len = selected.length;
    if (len < qas.length) {
      const question = qas[len].question;
      $("#question").text(question);
      const answers = qas[len].answers;
      for (let i = 0; i < answers.length; i++) {
        $("#id" + i).text(answers[i]);
      }
      for (let i = 0; i < answers.length; i++) {
        const div = $("#id" + i);
        buttons[i] = {
          x: div.offset()?.left,
          y: div.offset()?.top,
          w: div.width(),
          h: div.height(),
        };
      }
    }
  };

  function finish() { // DASパタン入力終了
    // masui_secret.box.html のようなURLのときはScrapboxページに飛ぶ
    // (EpisoBoxの仕様だが不要かも)
    if (location.href.match(/\.box\.html$/)) {
      location.href = "https://scrapbox.io/" +
        crypt(data.seed, secretstr());
      return;
    }
    if (location.href.match(/EpisoPassCall/)) {
      location.href = "/EpisoPassResult?" +
        escape(crypt(data.seed, secretstr()));
      return;
    }
    $("#das").children().remove();

    if (typeof (editor) != "undefined") { // 編集画面のときだけHTMLデータ取得ボタン処理
      make_html(data);
    }

    var newpass = crypt(data.seed, secretstr());
    const m = location.href.match(/([a-zA-Z\-]+)_invitation\.html/);
    if (m) {
      const invitationlink = `https://scrapbox.io/projects/${
        m[1]
      }/invitations/${newpass}`;
      location.href = invitationlink;
    }

    const center = $("<center>");
    $("#das").append(center);

    center.append($("<p>"));

    // 生成されたパスワードを表示
    // 値をコピーできるようにするため<input>を利用
    const passspan = $("<input>");
    passspan.val(newpass);
    passspan.attr("type", "text");
    passspan.attr("id", "passspan");
    passspan.css("font-size", width * 0.06);
    passspan.css("border-radius", width * 0.015);
    passspan.css("margin", width * 0.01);
    passspan.css("padding", width * 0.02);
    passspan.css("background-color", "#fff");
    passspan.css("border-style", "solid");
    passspan.css("border-width", "1pt");
    passspan.css("border-color", "#000");
    center.append(passspan);

    center.append($("<p>"));

    const show = $("<input>");
    show.attr("type", "button");
    show.attr("value", "表示");
    show.css("font-size", width * 0.05);
    show.css("border-radius", width * 0.015);
    show.css("margin", width * 0.01);
    show.css("padding", width * 0.02);
    show.css("background-color", "#fff");
    show.css("border-style", "solid");
    show.css("border-width", "1pt");
    show.css("border-color", "#000");
    show.click(function (event) {
      passspan.show();
      show.hide();
      again.show();
    });
    center.append(show);

    const again = $("<input>");
    again.attr("type", "button");
    again.attr("value", "再実行");
    again.css("font-size", width * 0.05);
    again.css("border-radius", width * 0.015);
    again.css("margin", width * 0.01);
    again.css("padding", width * 0.02);
    again.css("background-color", "#fff");
    again.css("border-style", "solid");
    again.css("border-width", "1pt");
    again.css("border-color", "#000");
    again.click(function (event) {
      init();
    });
    center.append(again);

    // 生成された文字列をコピー
    passspan.select();
    document.execCommand("copy");

    if (editor !== undefined) { // 利用画面
      passspan.hide();
      show.show();
      again.hide();
    } else { // DAS生成中の確認画面
      passspan.show();
      passspan.blur(); // 文字列を非選択状態にする
      show.hide();
      again.show();
    }
  }

  const secretstr = () => {
    const results = [];
    for (
      let j = 0, ref = qas.length;
      0 <= ref ? j < ref : j > ref;
      0 <= ref ? j++ : j--
    ) {
      results.push(j);
    }
    return results.map((i) => qas[i].question + qas[i].answers[selected[i]])
      .join("");
  };

  function initsize() {
    if ($("#contents")[0] == undefined) {
      width = browserWidth();
    } else {
      width = $("#contents").width();
    }
    height = browserHeight();
    for (var i = 0; i < answers.length; i++) {
      div = $("#id" + i);
      div.css("background-color", "#fff");
      div.css("width", width / 7);
      div.css("height", height / 10);
      div.css("font-size", width * 0.03);
      div.css("color", "#000");

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
    }

    $("#question").css("font-size", width * 0.05);
    $("#question").css("margin-top", "10px");
  }

  //
  // ClickまたはDragで選択する工夫
  // mouseenterイベントとかがあまり信用できないので自力でやる
  // dasmaker.jsと共通化したいのだが
  //
  function mouseenter(div) {
    curdiv = div;
    if (mousedown) {
      // curdiv.css('background-color','#f3f3f3');
      curdiv.css("background-image", `url("${noise}")`);
      w = curdiv.css("width");
      h = curdiv.css("height");
      curdiv.css("background-size", `${w} ${h}`);
      selected.push(curdiv.attr("id").replace(/id/, ""));
    }
  }

  function mouseleave(div) {
    if (mousedown) {
      curdiv.css("background-color", "#fff");
      curdiv.css("background-image", "");
      showQA();

      if (selected.length == qas.length) { // DAS入力終了
        finish();
      }
    }
    curdiv = null;
  }

  function mousemove(e) {
    if ($("#id0")[0] == undefined) return;
    if (!mousedown) return;

    var mousex = (e.pageX ? e.pageX : e.originalEvent.touches[0].pageX);
    var mousey = (e.pageY ? e.pageY : e.originalEvent.touches[0].pageY);

    // これがちょっと遅いかもしれないので改良したい
    //for(var i=0;i<answers.length;i++){
    //    let buttondiv = $('#id'+i);
    //    buttonx = buttondiv.offset().left;
    //    buttony = buttondiv.offset().top;
    //    buttonw = buttondiv.width();
    //    buttonh = buttondiv.height();
    //    if(buttonx < mousex && buttonx+buttonw > mousex &&
    //       buttony < mousey && buttony+buttonh > mousey){
    //  if(!curdiv || (curdiv.attr('id') != buttondiv.attr('id'))){
    //            if(curdiv){
    //    mouseleave(curdiv);
    //            }
    //            mouseenter(buttondiv);
    //            curdiv = buttondiv;
    //  }
    //  return;
    //    }
    //}
    // こんなので速度は変わらない気もする... 無意味かも
    for (var i = 0; i < answers.length; i++) {
      if (
        buttons[i].x < mousex && buttons[i].x + buttons[i].w > mousex &&
        buttons[i].y < mousey && buttons[i].y + buttons[i].h > mousey
      ) {
        if (!curdiv || (curdiv.attr("id") != ("id" + i))) {
          if (curdiv) {
            mouseleave(curdiv);
          }
          buttondiv = $("#id" + i);
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

  var init = function () {
    qas = data["qas"];

    curdiv = null;
    mousedown = false;
    selected = [];

    $(window).on("resize", initsize);

    $("#das").children().remove();
    if (typeof (editor) != "undefined") {
      lib.lib.show("#das");
    }

    var center = $("<center>");
    $("#das").append(center);
    $("#das").on("mousemove", mousemove);
    $("#das").on("touchmove", mousemove);

    // 問題領域
    var qdiv = $("<div>");
    qdiv.attr("height", 100);
    qdiv.css("display", "flex");
    qdiv.css("justify-content", "center");
    qdiv.css("align-items", "center");
    qdiv.attr("id", "question");
    center.append(qdiv);

    if (typeof (editor) != "undefined") {
      let comment = $("<span>");
      comment.text("DASパタンを押すかなぞって確認して下さい");
      center.append(comment);
    }

    center.append($("<p>"));

    // 回答領域
    answers = qas[0].answers; // 回答の数は同じということを仮定

    for (var i = 0; i < answers.length; i++) {
      var div = $("<div>");
      div.css("float", "left");
      div.attr("id", "id" + i);
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
      div.on("mouseup", function (e) {
        if (curdiv) mouseleave(curdiv);
        mousedown = false;
        curdiv = null;
      });
      div.on("touchend", function (e) {
        if (curdiv) mouseleave(curdiv);
        mousedown = false;
        curdiv = null;
      });
    }

    initsize();
    showQA();
  };

  init();

  // ファイル名を サービス名_アカウント と解釈
  //  e.g. Amazon_masui@pitecan.com
  // 拡張機能から参照できるように <body> の属性として登録する
  let m = location.href.match(/\/(\w+_[\w\.@]+)\.html$/);
  if (m) {
    data["name"] = m[1];
    $("body").attr("episodata", JSON.stringify(data));
    // console.log($('body').attr('episodata'))
  }
};
