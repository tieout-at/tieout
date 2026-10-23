// After `next build`: the static export writes prefetch segments as folders (`aufgaben/__next.aufgaben/__PAGE__.txt`),
// but the browser asks for them with dots (`aufgaben/__next.aufgaben.__PAGE__.txt`). Without this copy every prefetch
// answers 404 and the page falls back to a full load. Copies each nested file next to its folder under the dotted name.

import { copyFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const out = process.argv[2] ?? "out";
let copied = 0;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      for (const file of files(path)) {
        const dotted = [name, ...relative(path, file).split(sep)].join(".");
        copyFileSync(file, join(dir, dotted));
        copied += 1;
      }
    } else {
      walk(path);
    }
  }
}

walk(out);
console.log(`flatten-prefetch: ${copied} file(s) copied`);
