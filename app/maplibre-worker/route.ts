import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const file = path.join(process.cwd(), "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs");
  const source = await readFile(file, "utf8");
  const body = source.replace(/\/\/# sourceMappingURL=.*$/, "");
  return new Response(body, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
