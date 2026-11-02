import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const clarityTagUrl = "https://www.clarity.ms/tag/z7bcthqq88";
const microsoftPrivacyStatementUrl = "https://privacy.microsoft.com/en-us/privacystatement";
const advertisingOptOutUrl = "https://optout.aboutads.info/";
const publicDirectory = join(import.meta.dirname, "..", "public");
const htmlPages = readdirSync(publicDirectory, { recursive: true }).filter((path) => path.endsWith(".html"));

function readPage(page) {
  return readFileSync(join(publicDirectory, page), "utf8");
}

function contentOfFirst(tagName, html) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`))?.[1] ?? "";
}

for (const page of htmlPages) {
  const html = readPage(page);
  const head = contentOfFirst("head", html);

  test(`${page} queues Clarity calls in <head> until the Clarity tag loads`, () => {
    const window = {};
    for (const [, inlineScript] of head.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      runInNewContext(inlineScript, { window });
    }

    assert.equal(typeof window.clarity, "function");
    window.clarity("event", "pageview");
    assert.deepEqual(
      Array.from(window.clarity.q, (queuedCall) => [...queuedCall]),
      [["event", "pageview"]],
    );
  });

  test(`${page} loads the Clarity tag asynchronously after defining the queue`, () => {
    assert.deepEqual(head.match(/<script\b[^>]*>/g), ["<script>", `<script async src="${clarityTagUrl}">`]);
  });

  test(`${page} links to the privacy page from its footer`, () => {
    assert.match(contentOfFirst("footer", html), /<a href="\/?privacy\.html">Privacy<\/a>/);
  });
}

test("privacy.html gives the privacy notice that section 4.4(b) of the Clarity Terms of Use requires", () => {
  const privacyNotice = contentOfFirst("main", readPage("privacy.html")).replace(/\s+/g, " ");

  assert.match(privacyNotice, /Microsoft[^.]* may collect personal data from visitors/);
  assert.match(privacyNotice, /Microsoft[^.]* collects or receives[^.]* to provide Microsoft Advertising/);
  assert.ok(privacyNotice.includes(`href="${microsoftPrivacyStatementUrl}"`));
  assert.ok(privacyNotice.includes(`href="${advertisingOptOutUrl}"`));
});
