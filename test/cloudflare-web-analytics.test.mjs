import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const beaconUrl = "https://static.cloudflareinsights.com/beacon.min.js";
const mahataOrgSiteToken = "ac326de2e67d46d5ad49364a7c06cab7";
const publicDirectory = join(import.meta.dirname, "..", "public");
const htmlPages = readdirSync(publicDirectory, { recursive: true }).filter((path) => path.endsWith(".html"));

function attributesOf(openingTag) {
  return Object.fromEntries(
    Array.from(
      openingTag.matchAll(/\s([^\s=>]+)(?:=(?:"([^"]*)"|'([^']*)'))?/g),
      ([, name, doubleQuoted, singleQuoted]) => [name, doubleQuoted ?? singleQuoted ?? ""],
    ),
  );
}

for (const page of htmlPages) {
  const html = readFileSync(join(publicDirectory, page), "utf8");

  test(`${page} loads the Cloudflare Web Analytics beacon for mahata.org and no other script`, () => {
    const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
    assert.equal(scriptTags.length, 1, `Expected only the beacon script, found: ${scriptTags.join(" ")}`);

    const { "data-cf-beacon": beaconSettings, ...beaconAttributes } = attributesOf(scriptTags[0]);
    assert.deepEqual(beaconAttributes, { type: "module", src: beaconUrl });
    assert.deepEqual(JSON.parse(beaconSettings), { token: mahataOrgSiteToken });
  });

  test(`${page} loads the beacon right before </body>, as Cloudflare instructs`, () => {
    const htmlBeforeClosingBody = html.slice(0, html.lastIndexOf("</body>")).trimEnd();
    const lastTagBeforeClosingBody = htmlBeforeClosingBody.match(/<[^<>]+>$/)?.[0];
    assert.equal(lastTagBeforeClosingBody, "</script>");
  });
}
