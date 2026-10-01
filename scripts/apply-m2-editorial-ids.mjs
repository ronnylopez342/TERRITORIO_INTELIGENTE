import fs from "node:fs";
import * as parse5 from "parse5";

const html = fs.readFileSync("index.html", "utf8");

const registry = JSON.parse(
  fs.readFileSync("editor/registry.json", "utf8")
    .replace(/^\uFEFF/, "")
);

const doc = parse5.parse(html, {
  sourceCodeLocationInfo: true
});

function attr(node, name) {
  return node.attrs?.find(x => x.name === name)?.value ?? null;
}

function hasClass(node, className) {
  const value = attr(node, "class");

  if (!value) return false;

  return value
    .split(/\s+/)
    .filter(Boolean)
    .includes(className);
}

function walk(node, output = []) {
  if (node.tagName) output.push(node);

  for (const child of node.childNodes ?? []) {
    walk(child, output);
  }

  return output;
}

function insideView(node, viewName) {
  let current = node.parentNode;

  while (current) {

    if (attr(current, "data-view") === viewName) {
      return true;
    }

    current = current.parentNode;
  }

  return false;
}

function matches(node, locator) {

  if (
    locator.id &&
    attr(node, "id") !== locator.id
  ) {
    return false;
  }

  if (
    locator.tag &&
    node.tagName?.toLowerCase() !== locator.tag.toLowerCase()
  ) {
    return false;
  }

  if (
    locator.class &&
    !hasClass(node, locator.class)
  ) {
    return false;
  }

  if (locator.attr) {

    if (
      attr(node, locator.attr.name) !== locator.attr.value
    ) {
      return false;
    }
  }

  if (
    locator.scopeDataView &&
    !insideView(node, locator.scopeDataView)
  ) {
    return false;
  }

  return true;
}

const elements = walk(doc);
const edits = [];
const errors = [];

let already = 0;

for (const entry of registry.entries) {

  const found = elements.filter(node =>
    matches(node, entry.locator)
  );

  if (found.length !== 1) {

    errors.push(
      `${entry.tiId}: encontrados=${found.length}`
    );

    continue;
  }

  const node = found[0];

  const existing = attr(
    node,
    "data-ti-id"
  );

  if (existing) {

    if (existing === entry.tiId) {
      already++;
      continue;
    }

    errors.push(
      `${entry.tiId}: nodo ya tiene ${existing}`
    );

    continue;
  }

  const location =
    node.sourceCodeLocation?.startTag;

  if (!location) {

    errors.push(
      `${entry.tiId}: sin sourceCodeLocation`
    );

    continue;
  }

  let insertAt =
    location.endOffset - 1;

  if (html[insertAt] !== ">") {

    errors.push(
      `${entry.tiId}: cierre de etiqueta inesperado`
    );

    continue;
  }

  if (html[insertAt - 1] === "/") {
    insertAt--;
  }

  edits.push({
    position: insertAt,
    text: ` data-ti-id="${entry.tiId}"`
  });
}

if (errors.length > 0) {

  console.error("");
  console.error("M2 NO APLICADA");
  console.error("");

  for (const error of errors) {
    console.error(`FAIL | ${error}`);
  }

  process.exitCode = 1;

} else {

  edits.sort(
    (a, b) =>
      b.position - a.position
  );

  let output = html;

  for (const edit of edits) {

    output =
      output.slice(0, edit.position) +
      edit.text +
      output.slice(edit.position);
  }

  fs.writeFileSync(
    "index.html",
    output,
    "utf8"
  );

  console.log("");
  console.log("M2 IDENTIDAD EDITORIAL APLICADA");
  console.log("");
  console.log(`REGISTRY: ${registry.entries.length}`);
  console.log(`INSERTADOS: ${edits.length}`);
  console.log(`YA EXISTENTES: ${already}`);
  console.log("FAIL: 0");
}
