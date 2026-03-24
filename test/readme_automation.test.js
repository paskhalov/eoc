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

function withMockedModule(requestName, mockModule, fn) {
  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === requestName) {
      return mockModule;
    }
    return originalLoad(request, parent, isMain);
  };
  try {
    return fn();
  } finally {
    Module._load = originalLoad;
  }
}

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
  });

  it("parseBlock throws when no rows are found", () => {
    const { parseBlock } = require(helpToMarkdownPath);
    assert.throws(
      () => parseBlock(["Commands:", "Command"], "Commands:\n\n"),
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
    const fakePty = {
      _lastTerm: null,
      spawn() {
        const term = {
          onData(cb) {
            term._onData = cb;
          },
          onExit(cb) {
            term._onExit = cb;
          },
          _onData: null,
          _onExit: null
        };
        fakePty._lastTerm = term;
        return term;
      }
    };

    await withMockedModule("node-pty", fakePty, async () => {
      delete require.cache[ptyCapturePath];
      const { captureCommandOutput } = require(ptyCapturePath);
      const promise = captureCommandOutput("fake", ["--help"]);
      fakePty._lastTerm._onData("hello");
      fakePty._lastTerm._onExit({ exitCode: 0 });
      const output = await promise;
      assert.strictEqual(output, "hello");
    });
  });

  it("captureCommandOutput rejects on non-zero exit", async () => {
    const fakePty = {
      _lastTerm: null,
      spawn() {
        const term = {
          onData(cb) {
            term._onData = cb;
          },
          onExit(cb) {
            term._onExit = cb;
          },
          _onData: null,
          _onExit: null
        };
        fakePty._lastTerm = term;
        return term;
      }
    };

    await withMockedModule("node-pty", fakePty, async () => {
      delete require.cache[ptyCapturePath];
      const { captureCommandOutput } = require(ptyCapturePath);
      const promise = captureCommandOutput("fake", []);
      fakePty._lastTerm._onExit({ exitCode: 2 });
      await assert.rejects(promise, /exited with 2/);
    });
  });

});
