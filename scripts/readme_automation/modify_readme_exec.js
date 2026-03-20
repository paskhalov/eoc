#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const assert = require('assert');
const { parseBlock } = require("./help_to_markdown");
const { captureCommandOutput } = require("./pty_capture");
const { updateSection } = require("./inject_readme_section");

async function main (){
  const tmp_data = {};
  let help_text = await captureCommandOutput("eoc", ["--help"]);
  help_text = help_text.replace(/\r\n/g, "\n");
  assert.ok(["Options:","Commands:"].every(sub => help_text.includes(sub)),'"eoc --help" should includes Commands and Options');
  tmp_data.HELP_TEXT = help_text;
  const res = parseBlock(['Commands:','Command'],help_text);
  //console.log(res);
  //fs.writeFileSync('/tmp/COMMANDS_MARKDOWN', res);
  let readMeContent = fs.readFileSync('fake_readme.md', "utf8");
  readMeContent = updateSection('commands', res, readMeContent);
  console.log(readMeContent);
}

if (require.main === module) {
  main();
};
