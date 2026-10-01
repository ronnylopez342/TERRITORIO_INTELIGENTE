import fs from "node:fs";
import * as parse5 from "parse5";

const html = fs.readFileSync(
  "index.html",
  "utf8"
);

const baselinePath =
  process.env.TI_M2_BASELINE;

const registry = JSON.parse(
  fs.readFileSync(
    "editor/registry.json",
    "utf8"
  ).replace(/^\uFEFF/, "")
);

let failed = 0;

function fail(message) {
  failed++;
  console.log(`FAIL | ${message}`);
}

function pass(message) {
  console.log(`PASS | ${message}`);
}

function attr(node, name) {
  return node.attrs?.find(
    x => x.name === name
  )?.value ?? null;
}

function walk(node, output = []) {

  if (node.tagName) {
    output.push(node);
  }

  for (
    const child of
    node.childNodes ?? []
  ) {
    walk(child, output);
  }

  return output;
}

const doc = parse5.parse(
  html,
  {
    sourceCodeLocationInfo: true
  }
);

const elements = walk(doc);

const actualIds =
  elements
    .map(node =>
      attr(node, "data-ti-id")
    )
    .filter(Boolean);

const registryIds =
  registry.entries.map(
    x => x.tiId
  );

const duplicateActual =
  actualIds.filter(
    (id, index) =>
      actualIds.indexOf(id) !== index
  );

const duplicateRegistry =
  registryIds.filter(
    (id, index) =>
      registryIds.indexOf(id) !== index
  );

if (duplicateActual.length === 0) {
  pass("0 data-ti-id duplicados en HTML");
} else {
  fail(
    `data-ti-id duplicados: ${[
      ...new Set(duplicateActual)
    ].join(", ")}`
  );
}

if (duplicateRegistry.length === 0) {
  pass("0 tiId duplicados en registry");
} else {
  fail(
    `registry duplicado: ${[
      ...new Set(duplicateRegistry)
    ].join(", ")}`
  );
}

for (const entry of registry.entries) {

  const matches =
    elements.filter(
      node =>
        attr(node, "data-ti-id") ===
        entry.tiId
    );

  if (matches.length === 1) {

    pass(
      `${entry.tiId} | ${entry.mode}`
    );

  } else {

    fail(
      `${entry.tiId} encontrados=${matches.length}`
    );
  }
}

const extras =
  actualIds.filter(
    id => !registryIds.includes(id)
  );

if (extras.length === 0) {
  pass("0 data-ti-id fuera del registry");
} else {
  fail(
    `IDs fuera del registry: ${extras.join(", ")}`
  );
}

const functionalIds =
  elements
    .map(node => attr(node, "id"))
    .filter(Boolean);

const duplicateFunctional =
  functionalIds.filter(
    (id, index) =>
      functionalIds.indexOf(id) !== index
  );

if (duplicateFunctional.length === 0) {
  pass("0 IDs funcionales duplicados");
} else {
  fail(
    `IDs funcionales duplicados: ${[
      ...new Set(duplicateFunctional)
    ].join(", ")}`
  );
}

/*
 * Prueba ZERO-VISUAL / ZERO-STRUCTURAL:
 * al retirar exactamente los nuevos atributos,
 * index.html debe ser byte por byte igual
 * al backup anterior.
 */

if (
  baselinePath &&
  fs.existsSync(baselinePath)
) {

  const baseline =
    fs.readFileSync(
      baselinePath,
      "utf8"
    );

  const stripped =
    html.replace(
      /\sdata-ti-id="[^"]+"/g,
      ""
    );

  if (stripped === baseline) {

    pass(
      "Unica diferencia contra baseline = data-ti-id"
    );

  } else {

    fail(
      "Existen diferencias adicionales contra baseline"
    );
  }

} else {

  fail(
    "No se recibio baseline para comparacion"
  );
}

console.log("");
console.log(`REGISTRY: ${registryIds.length}`);
console.log(`HTML DATA-TI-ID: ${actualIds.length}`);
console.log(`FAIL: ${failed}`);
console.log("");

if (failed > 0) {
  process.exitCode = 1;
}
