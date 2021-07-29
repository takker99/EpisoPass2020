import { fromUint8Array } from "https://deno.land/x/base64@v0.2.1/mod.ts";

await Deno.writeTextFile(
  "../src/noiseGif.ts",
  `export const noise = "${await datauri("../src/noise.gif")}"`,
);

async function datauri(filePath: string): Promise<string> {
  const content = await Deno.readFile(filePath);
  return `data:image/gif;base64,${fromUint8Array(content)}`;
}
