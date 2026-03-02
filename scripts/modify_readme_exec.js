#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const pty = require("node-pty");
const fs = require("fs");
const assert = require('assert');
const { parseCommandsBlock } = require("./markdown_from_help");

function getHelpOutput() {
  return new Promise((resolve, reject) => {
    let output = "";

    // Create a fake wide terminal
    const term = pty.spawn("eoc", ["--help"], {
      name: "xterm-color",
      cols: 200,      // 👈 controls wrapping width
      rows: 40,
      cwd: process.cwd(),
      env: process.env
    });

    term.onData(data => {
      output += data;
    });

    term.onExit(({ exitCode }) => {
      if (exitCode !== 0) {
        reject(new Error(`eoc exited with ${exitCode}`));
      } else {
        resolve(output);
      }
    });
  });
}

(async function (){
    
    let tmp_data = {};
    let help_text = await getHelpOutput();
    help_text = help_text.replace(/\r\n/g, "\n");
    assert.ok(["Options:","Commands:"].every(sub => help_text.includes(sub)),'"eoc --help" includes Commands and Options');
    
    tmp_data['HELP_TEXT'] = help_text;
    const res = parseCommandsBlock(['Commands:','Command'],help_text);
    console.log(res);
    fs.writeFileSync('/tmp/COMMANDS_MARKDOWN', res);
    
})();
