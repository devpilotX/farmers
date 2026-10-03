import { renderToString } from "react-dom/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Homepage } from "./home/Homepage";
const template = await readFile("dist/index.html", "utf8");
const placeholder = '<div id="root"></div>';
if (!template.includes(placeholder))
  throw new Error("The homepage root was not found in the build template.");
const html = template.replace(
  placeholder,
  `<div id="root">${renderToString(<Homepage />)}</div>`,
);
await writeFile("dist/index.html", html);
await mkdir("dist/workspace", { recursive: true });
await writeFile(
  "dist/workspace/index.html",
  template.replace('content="index,follow"', 'content="noindex,nofollow"'),
);
console.info(
  "Prerendered the public homepage and created the non-indexed workspace entry.",
);
