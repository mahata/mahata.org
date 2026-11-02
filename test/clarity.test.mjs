import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const clarityTagUrl = "https://www.clarity.ms/tag/z7bcthqq88";
const microsoftPrivacyStatementUrl = "https://www.microsoft.com/privacy/privacystatement";
const publicDirectory = join(import.meta.dirname, "..", "public");
const htmlPages = readdirSync(publicDirectory, { recursive: true }).filter((path) => path.endsWith(".html"));

function contentOfFirst(tagName, html) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)</${tagName}>`))?.[1] ?? "";
}

for (const page of htmlPages) {
  const html = readFileSync(join(publicDirectory, page), "utf8");
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

  test(`${page} discloses Microsoft Clarity in its footer`, () => {
    const footer = contentOfFirst("footer", html);

    assert.match(footer, /Microsoft Clarity/);
    assert.ok(footer.includes(`href="${microsoftPrivacyStatementUrl}"`));
  });
}
