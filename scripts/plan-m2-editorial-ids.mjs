import fs from "node:fs";
import * as parse5 from "parse5";

const html = fs.readFileSync("index.html", "utf8");
const registry = JSON.parse(
  fs.readFileSync("editor/registry.json", "utf8")
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
  if (locator.id && attr(node, "id") !== locator.id) {
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

const registryIds = registry.entries.map(x => x.tiId);
const duplicateRegistryIds = registryIds.filter(
  (id, i) => registryIds.indexOf(id) !== i
);

let failed = 0;
let ok = 0;

console.log("");
console.log("TERRITORIO INTELIGENTE - M2 PLAN");
console.log("");

if (duplicateRegistryIds.length > 0) {
  failed++;

  console.log(
    "FAIL | IDs duplicados en registry:",
    duplicateRegistryIds.join(", ")
  );
}

for (const entry of registry.entries) {
  const found = elements.filter(node =>
    matches(node, entry.locator)
  );

  if (found.length !== 1) {
    failed++;

    console.log(
      `FAIL | ${entry.tiId} | encontrados=${found.length}`
    );

    continue;
  }

  const existing = attr(found[0], "data-ti-id");

  if (
    existing &&
    existing !== entry.tiId
  ) {
    failed++;

    console.log(
      `FAIL | ${entry.tiId} | ya tiene data-ti-id=${existing}`
    );

    continue;
  }

  ok++;

  console.log(
    `PASS | ${entry.tiId} | ${entry.mode}`
  );
}

const currentTiIds = elements
  .map(node => attr(node, "data-ti-id"))
  .filter(Boolean);

console.log("");
console.log(`REGISTRY: ${registry.entries.length}`);
console.log(`LOCATORS OK: ${ok}`);
console.log(`DATA-TI-ID ACTUALES: ${currentTiIds.length}`);
console.log(`FAIL: ${failed}`);
console.log("");

if (failed > 0) {
  process.exitCode = 1;
}
