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
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="dom" />
import { createHash } from "https://deno.land/std@0.103.0/hash/mod.ts";
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

const charkind = (c: string, charset: string[]) => {
  return __range__(0, charset.length, false).findIndex((i) =>
    charset[i].indexOf(c) >= 0
  );
};

// crypt_char(crypt_char(c,n),n) == c になるような文字置換関数
const crypt_char = function (
  c: string,
  n: number,
  charset: string[] = origcharset,
) {
  const kind = charkind(c, charset);
  const chars = charset[kind];
  const cind = chars.indexOf(c);
  const len = chars.length;
  const ind = ((n - cind) + len) % len;
  return chars[ind];
};

//
// secret_stringとcharset[]にもとづいてseedを暗号的に変換する
// crypt(crypt(s,data),data) == s になる
//
export const crypt = (seed: string, secret_string: string) => {
  // ハッシュ値ぽいときHex文字だけ使うことにする。ちょっと心配だが...
  // Hex文字が32文字以上で、数字と英字が入ってればまぁハッシュ値と思って良いのではないか...
  const useHex = seed.match(/[0-9a-f]{32}/) && seed.match(/[a-f]/) &&
    seed.match(/[0-9]/);

  // secret_stringのMD5の32バイト値の一部を取り出して数値化し、
  // その値にもとづいて文字置換を行なう
  const hash = createHash("md5");
  hash.update(secret_string);
  const hashString = hash.toString();
  return __range__(0, seed.length, false).map((i) => {
    const j = i % 8;
    const s = hashString.substring(j * 4, (j * 4) + 4);
    const n = parseInt(s, 16);
    return crypt_char(seed[i], n + i, useHex ? hexcharset : origcharset);
  });
};
