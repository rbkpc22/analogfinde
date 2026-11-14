import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITES } from "../lib/data.ts";

const outFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "lib", "nasa-power.json");

const PARAMETERS = ["T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR"];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function annualValue(parameter, name, siteName) {
  const value = parameter?.[name]?.ANN;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= -900) {
    throw new Error(`${siteName}: sin valor anual (ANN) válido para ${name}`);
  }
  return value;
}

async function fetchSite(site) {
  const url = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  url.searchParams.set("parameters", PARAMETERS.join(","));
  url.searchParams.set("community", "RE");
  url.searchParams.set("longitude", String(site.lng));
  url.searchParams.set("latitude", String(site.lat));
  url.searchParams.set("format", "JSON");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "AnalogFinder/0.1 (NASA Space Apps Challenge 2026)",
    },
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    throw new Error(`${site.name}: HTTP ${response.status}`);
  }

  const body = await response.json();
  const parameter = body?.properties?.parameter;
  return {
    T2M: annualValue(parameter, "T2M", site.name),
    T2M_MAX: annualValue(parameter, "T2M_MAX", site.name),
    T2M_MIN: annualValue(parameter, "T2M_MIN", site.name),
    PRECTOTCORR: annualValue(parameter, "PRECTOTCORR", site.name),
  };
}

const results = {};

for (let index = 0; index < SITES.length; index += 1) {
  const site = SITES[index];
  if (index > 0) {
    await sleep(1000);
  }

  process.stdout.write(`(${index + 1}/${SITES.length}) ${site.name}… `);
  let record;
  try {
    record = await fetchSite(site);
  } catch {
    process.stdout.write("reintento… ");
    await sleep(1000);
    record = await fetchSite(site);
  }

  results[site.name] = record;
  process.stdout.write(
    `T2M ${record.T2M} °C, precip ${record.PRECTOTCORR} mm/día\n`,
  );
}

await writeFile(outFile, `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(`Guardado ${Object.keys(results).length} lugares en ${outFile}`);
