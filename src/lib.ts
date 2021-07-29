//
// ライブラリのJS
//
import $ from "https://esm.sh/jquery@3.6.0";

declare const dastemplate: string;

export function make_html<T extends {}>(data: T) {
  // https://qiita.com/daiiz/items/9b9eddb5de9246b017bc daiizOA
  // これでHTML取得リンクができる
  const a = $("#htmlbutton");
  a.attr("download", "RunEpisoPass.html");

  const lines = dastemplate.split(/\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/REPLACE_THIS_LINE$/)) {
      lines[i] = `const data = ${JSON.stringify(data)}`;
    }
  }
  const html = lines.join("\n");

  var blob = new Blob([html], { type: "text/html" });
  //var url = window.webkitURL.createObjectURL(blob);
  var url = URL.createObjectURL(blob);
  a.attr("href", url);
}

export function show(id: string) {
  $("#contents").children().css("display", "none");
  $(id).css("display", "block");
}
