#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function parseCommandsBlock(block_params,text) {
  const lines = text.split("\n");
  let inBlock = false;
  const rows = [];
  for (const line of lines) {
    if (line.trim() === block_params[0]) {
      inBlock = true;
    }
    else if (inBlock) {
      if (!line.trim()) {break;}
      const parts = line.trim().split(/\s{2,}/);
      const cmd = parts[0];
      const desc = parts.slice(1).join(" ") || "";
      rows.push([cmd, desc]);
    }
  }
  if (!rows.length)
  {
    throw new Error('no data something wrong');
  }
  const table = [
    `| ${block_params[1]} | Description |`,
    "|--------|-------------|",
    ...rows.map(([cmd, desc]) => `| \`${cmd}\` | ${desc} |`)
  ];
  return `${table.join("\n")  }\n`;
}

function main() {
  const sectionName = process.argv[2];
  if (!['commands', 'options'].includes(sectionName))
  {
    throw new Error('wrong section name');
  }
  const block_params = {'commands':['Commands:','Command'],'options':['Options:','Option']}[sectionName];
  const data = fs.readFileSync(process.argv[3], 'utf8');
  const markdown = parseCommandsBlock(block_params,data);
  process.stdout.write(markdown);
};

if (require.main === module) {
  main();
};
