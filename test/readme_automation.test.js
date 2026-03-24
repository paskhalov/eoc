/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const Module = require("module");

describe("readme_automation scripts", () => {
  const scriptsDir = path.resolve(__dirname, "../scripts/readme_automation");
  it("parseBlock builds a markdown table from a help block", () => {
    const { parseBlock } = require(path.join(scriptsDir, "help_to_markdown.js"));
    const text = `
Usage: eoc [options] [command]\n
Commands:
  foo   does foo
  bar   does bar\n
Options:
  -h, --help  output help
`;
    const res = parseBlock("Commands:", text);
    assert.equal(JSON.stringify(res),JSON.stringify([['foo','does foo'],['bar','does bar']]) );
    const res2 = parseBlock("Options:", text);
    assert.equal(JSON.stringify(res2),JSON.stringify([['-h, --help','output help']]) );
  });
  it("parseBlock throws when no rows are found", () => {
    const { parseBlock } = require(path.join(scriptsDir, "help_to_markdown.js"));
    assert.throws(
      () => parseBlock("Commands:", ""),
      /no data/
    );
  });
  it("updateSection replaces only the requested section", () => {
    const { updateSection } = require(path.join(scriptsDir, "inject_readme_section.js"));
    const readme = `
before
<!-- BEGIN COMMANDS SECTION -->
old
<!-- END COMMANDS SECTION -->
<!-- BEGIN OPTIONS SECTION -->
keep
<!-- END OPTIONS SECTION -->
after`
    const updated = updateSection("commands", "new content", readme);
    assert.ok(!updated.includes("old"));
    assert.ok(["new content","keep","after","before","<!-- BEGIN COMMANDS SECTION -->"].every(sub => updated.includes(sub)));
  });
  it("captureCommandOutput resolves collected output", async () => {
    const { captureCommandOutput } = require(path.join(scriptsDir, "pty_capture.js"));
    const output = await captureCommandOutput("printf", ["hello"]);
    assert.strictEqual(output, "hello");
  });
  it("bulletListTemplate renders a list", async () => {
    const { bulletListTemplate } = require(path.join(scriptsDir, "help_to_markdown.js"));
    const output = bulletListTemplate([['one','a'],['two','b'],['three','c']]);
    assert.strictEqual(output, "* `one`  a\n* `two`  b\n* `three`  c\n");
  });
});
