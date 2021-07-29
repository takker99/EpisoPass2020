/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
//
// crypt.coffee - EpisoPassでの文字置換
//
// Toshiyuki Masui @ Pitecan.com
// Last Modified: 2019/12/27
//
import { MD5_hexhash } from "./md5.ts";
import { __range__ } from "./utils.ts";

//  文字種ごとに置換を行なうためのテーブル
const origcharset = [
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
  "-",
  "~!@#$%^&*()_=+[{]}|;:.,#?",
  " ",
  "\"'/<>\\`",
];

const hexcharset = [
  "0123456789abcdef",
];

let charset = origcharset;

const charkind = (c: string) => {
  return __range__(0, charset.length, false).findIndex((i) =>
    charset[i].indexOf(c) >= 0
  );
};

// crypt_char(crypt_char(c,n),n) == c になるような文字置換関数
const crypt_char = function (c: string, n: number) {
  const kind = charkind(c);
  const chars = charset[kind];
  const cind = chars.indexOf(c);
  const len = chars.length;
  const ind = ((n - cind) + len) % len;
  return chars[ind];
};

//
// UTF8文字列をバイト文字列(?)に変換
// (MD5_hexhashがUTF8データをうまく扱えないため)
//
const utf2bytestr = (text: string) => {
  let result = "";
  if (text === null) return result;
  __range__(0, text.length, false).forEach(function (i) {
    const c = text.charCodeAt(i);
    if (c <= 0x7f) {
      return result += String.fromCharCode(c);
    } else {
      if (c <= 0x07ff) {
        result += String.fromCharCode(((c >> 6) & 0x1F) | 0xC0);
        return result += String.fromCharCode((c & 0x3F) | 0x80);
      } else {
        result += String.fromCharCode(((c >> 12) & 0x0F) | 0xE0);
        result += String.fromCharCode(((c >> 6) & 0x3F) | 0x80);
        return result += String.fromCharCode((c & 0x3F) | 0x80);
      }
    }
  });
  return result;
};

//
// secret_stringとcharset[]にもとづいてseedを暗号的に変換する
// crypt(crypt(s,data),data) == s になる
//
export const crypt = (seed: string, secret_string: string) => {
  // ハッシュ値ぽいときHex文字だけ使うことにする。ちょっと心配だが...
  // Hex文字が32文字以上で、数字と英字が入ってればまぁハッシュ値と思って良いのではないか...
  if (
    seed.match(/[0-9a-f]{32}/) && seed.match(/[a-f]/) && seed.match(/[0-9]/)
  ) {
    charset = hexcharset;
  } else {
    charset = origcharset;
  }

  // secret_stringのMD5の32バイト値の一部を取り出して数値化し、
  // その値にもとづいて文字置換を行なう
  const hash = MD5_hexhash(utf2bytestr(secret_string));
  let res = "";
  __range__(0, seed.length, false).forEach(function (i) {
    const j = i % 8;
    const s = hash.substring(j * 4, (j * 4) + 4);
    const n = parseInt(s, 16);
    return res += crypt_char(seed[i], n + i);
  });
  return res;
};
