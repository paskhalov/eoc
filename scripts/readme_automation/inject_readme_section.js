#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

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

module.exports = {
  updateSection
};
