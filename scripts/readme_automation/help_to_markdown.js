#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

function tableTemplate(rows,firstColumnName)
{
  const table = [
    `| ${firstColumnName} | Description |`,
    "|--------|-------------|",
    ...rows.map(([cmd, desc]) => `| \`${cmd}\` | ${desc} |`)
  ];
  return `${table.join("\n")  }\n`;
}

export function bulletListTemplate(rows)
{
    const list = rows.map(([cmd, desc]) => `* \`${cmd}\`  ${desc}`);
    return `${list.join("\n")  }\n`;
}

export function parseBlock(block_name,text) {
  const lines = text.split("\n");
  let inBlock = false;
  const rows = [];
  for (const line of lines) {
    if (line.trim() === block_name) {
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
  return rows;
}
