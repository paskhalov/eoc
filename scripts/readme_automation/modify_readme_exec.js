#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const assert = require('assert');
const { parseBlock, bulletListTemplate, updateSection } = require("./help_to_markdown");
const { getHelp } = require("../../src/eoc");

function main (){
  const tmp_data = {};
  let help_text = getHelp();
  help_text = help_text.replace(/\r\n/g, "\n");
  assert.ok(["Options:","Commands:"].every(sub => help_text.includes(sub)),'"eoc --help" should includes Commands and Options');
  tmp_data.HELP_TEXT = help_text;
  const commands = parseBlock('Commands:',help_text);
  const commandsMarkdown = bulletListTemplate(res);
  let readMeContent = fs.readFileSync('README.md', "utf8");
  readMeContent = updateSection('commands', commandsMarkdown, readMeContent);
  console.log(readMeContent);
}

if (require.main === module) {
  main();
};
