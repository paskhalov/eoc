#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateSection(sectionName, newContent, readMeContent) {
  const start = `<!-- BEGIN ${sectionName.toUpperCase()} SECTION -->`;
  const end = `<!-- END ${sectionName.toUpperCase()} SECTION -->`;
  const regex = new RegExp(
    `(${escapeRegex(start)})([\\s\\S]*?)(${escapeRegex(end)})`,
    "g"
  );
  return readMeContent.replace(regex, `$1\n${newContent}\n$3`);
}

function main (){
  const sectionName = process.argv[2];
  if (!['commands', 'options'].includes(sectionName))
  {
    throw new Error('this section name is not allowed');
  }
  const newContent = fs.readFileSync(process.argv[3], "utf8");
  let readMeContent = fs.readFileSync(process.argv[4], "utf8");
  readMeContent = updateSection(sectionName, newContent, readMeContent);
  process.stdout.write(readMeContent);
}

if (require.main === module) {
  main();
};
