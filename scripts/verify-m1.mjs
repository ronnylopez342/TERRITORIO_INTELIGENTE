import fs from "node:fs";

const failures = [];
const passes = [];

function check(condition, message) {
  if (condition) {
    passes.push(message);
  } else {
    failures.push(message);
  }
}

const requiredFiles = [
  "index.html",
  "css/app.css",
  "js/app.js",
  "js/requirements.js",
  "data/demo-content.json",
  "data/data-territorio.json",
  "data/home.json",
  "data/requirements.json",
  "data/veredas-subachoque.geojson"
];

for (const file of requiredFiles) {
  check(fs.existsSync(file), `Existe ${file}`);
}

const html = fs.readFileSync("index.html", "utf8");

check(
  html.includes('data-build="territorio-demo-functional-v2.3-realista-editorial"'),
  "Build marker V2.3 correcto"
);

check(
  html.includes('href="css/app.css?v=demo23"'),
  "CSS externo correcto"
);

check(
  html.includes('src="js/app.js?v=demo23"'),
  "app.js externo correcto"
);

check(
  html.includes('src="js/requirements.js?v=demo23"'),
  "requirements.js externo correcto"
);

check(
  !/<style(?:\s|>)/i.test(html),
  "Sin bloque style inline"
);

const routes = [
  "home",
  "data",
  "desarrollo",
  "cumplimiento",
  "politicas",
  "insights",
  "servicios",
  "login"
];

for (const route of routes) {
  check(
    html.includes(`data-route="${route}"`) ||
    html.includes(`data-view="${route}"`),
    `Ruta ${route}`
  );
}

const protectedIds = [
  "siteHeader",
  "menuToggle",
  "mobileMenu",
  "heroMedia",
  "heroLocalVideo",
  "dataGlobalStatus",
  "dataVisorWorkspace",
  "planDashboard",
  "complianceDashboard",
  "policyDashboard",
  "insightDashboard",
  "serviceGrid",
  "loginForm",
  "detailDialog",
  "assistantPanel",
  "editorPanel",
  "toast"
];

for (const id of protectedIds) {
  check(
    html.includes(`id="${id}"`),
    `ID protegido ${id}`
  );
}

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)]
  .map(match => match[1]);

const seen = new Set();
const duplicates = new Set();

for (const id of ids) {
  if (seen.has(id)) duplicates.add(id);
  seen.add(id);
}

check(
  duplicates.size === 0,
  "Sin IDs HTML duplicados"
);

console.log("");
console.log("TERRITORIO INTELIGENTE - VERIFY M1");
console.log("");

for (const item of passes) {
  console.log(`PASS | ${item}`);
}

for (const item of failures) {
  console.log(`FAIL | ${item}`);
}

console.log("");
console.log(`PASS: ${passes.length}`);
console.log(`FAIL: ${failures.length}`);

if (failures.length > 0) {
  process.exitCode = 1;
}
