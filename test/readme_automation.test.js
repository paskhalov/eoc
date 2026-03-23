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
    const res = parseBlock(["Commands:", "Command"], text);
    assert.ok(res == [['foo','does foo'],['bar','does bar']] );
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

  it("modify_readme_exec updates commands section using captured help", () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "readme-auto-"));
    const fakeReadme = [
      "header",
      "<!-- BEGIN COMMANDS SECTION -->",
      "old",
      "<!-- END COMMANDS SECTION -->",
      "footer"
    ].join("\n");
    fs.writeFileSync(path.join(tempDir, "fake_readme.md"), fakeReadme, "utf8");

    const helpText = [
      "Usage: eoc [options] [command]",
      "",
      "Options:",
      "  -h, --help  output usage information",
      "",
      "Commands:",
      "  alpha   does alpha",
      "  beta    does beta",
      ""
    ].join("\n");

    const preloadPath = path.join(tempDir, "preload_mock_pty.js");
    fs.writeFileSync(
      preloadPath,
      [
        'const Module = require("module");',
        "const originalLoad = Module._load;",
        "Module._load = function(request, parent, isMain) {",
        '  if (request === "./pty_capture" && parent && parent.filename && parent.filename.includes("scripts/readme_automation/modify_readme_exec.js")) {',
        "    return { captureCommandOutput: async () => process.env.EOC_HELP_TEXT || \"\" };",
        "  }",
        "  return originalLoad(request, parent, isMain);",
        "};"
      ].join("\n"),
      "utf8"
    );

    const output = execFileSync(
      process.execPath,
      [modifyReadmeExecPath],
      {
        cwd: tempDir,
        env: {
          ...process.env,
          NODE_OPTIONS: `--require ${preloadPath}`,
          EOC_HELP_TEXT: helpText
        }
      }
    ).toString();

    assert.ok(output.includes("| Command | Description |"));
    assert.ok(output.includes("| `alpha` | does alpha |"));
    assert.ok(output.includes("<!-- BEGIN COMMANDS SECTION -->"));
  });

  it("refresh_readme_sections.sh retains the readme update pipeline", () => {
    const script = fs.readFileSync(refreshReadmeSectionsPath, "utf8");
    assert.ok(script.includes("eoc --help"));
    assert.ok(script.includes("inject_readme_section.js"));
    assert.ok(script.includes("README.md"));
  });
});
