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
  const helpToMarkdownPath = path.resolve(
    __dirname,
    "../scripts/readme_automation/help_to_markdown.js"
  );
  const injectReadmeSectionPath = path.resolve(
    __dirname,
    "../scripts/readme_automation/inject_readme_section.js"
  );
  const ptyCapturePath = path.resolve(
    __dirname,
    "../scripts/readme_automation/pty_capture.js"
  );
  const modifyReadmeExecPath = path.resolve(
    __dirname,
    "../scripts/readme_automation/modify_readme_exec.js"
  );
  const refreshReadmeSectionsPath = path.resolve(
    __dirname,
    "../scripts/readme_automation/refresh_readme_sections.sh"
  );

  it("parseBlock builds a markdown table from a help block", () => {
    const { parseBlock } = require(helpToMarkdownPath);
    const text = [
      "Usage: eoc [options] [command]",
      "",
      "Commands:",
      "  foo   does foo",
      "  bar   does bar",
      "",
      "Options:",
      "  -h, --help  output help",
      ""
    ].join("\n");
    const res = parseBlock("Commands:", text);
    assert.equal(JSON.stringify(res),JSON.stringify([['foo','does foo'],['bar','does bar']]) );
    const res2 = parseBlock("Options:", text);
    assert.equal(JSON.stringify(res2),JSON.stringify([['-h, --help','output help']]) );
  });

  it("parseBlock throws when no rows are found", () => {
    const { parseBlock } = require(helpToMarkdownPath);
    assert.throws(
      () => parseBlock("Commands:", ""),
      /no data/
    );
  });

  it("updateSection replaces only the requested section", () => {
    const { updateSection } = require(injectReadmeSectionPath);
    const readme = [
      "before",
      "<!-- BEGIN COMMANDS SECTION -->",
      "old",
      "<!-- END COMMANDS SECTION -->",
      "",
      "<!-- BEGIN OPTIONS SECTION -->",
      "keep",
      "<!-- END OPTIONS SECTION -->",
      "after"
    ].join("\n");
    const updated = updateSection("commands", "new content", readme);
    assert.ok(updated.includes("new content"));
    assert.ok(updated.includes("keep"));
    assert.ok(!updated.includes("old"));
  });

  it("captureCommandOutput resolves collected output", async () => {

      const { captureCommandOutput } = require(ptyCapturePath);
      const output = await captureCommandOutput("printf", ["hello"]);
      assert.strictEqual(output, "hello");
  });

  it("bulletListTemplate renders a list", async () => {

      const { bulletListTemplate } = require(helpToMarkdownPath);
      const output = bulletListTemplate([['one','a'],['two','b'],['three','c']]);
      assert.strictEqual(output, "* `one`  a\n* `two`  b\n* `three`  c\n");
  });

});
