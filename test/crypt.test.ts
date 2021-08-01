/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
import { crypt } from "../src/crypt.ts";
import { assertEquals } from "https://deno.land/std@0.103.0/testing/asserts.ts";

Deno.test("2回適用すると元に戻る x10000回", () => {
  for (let i = 0; i < 10000; i++) {
    const seed = Math.round(Math.random() * (10 ** 32)).toString(16);
    const secret = Math.round(Math.random() * (10 ** 32)).toString(16);

    assertEquals(crypt(crypt(seed, secret), secret), seed);
  }
});
