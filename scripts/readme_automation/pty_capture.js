#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

export function captureCommandOutput(command, args = []) {
  return new Promise((resolve, reject) => {
    let output = "";
    // Create a fake wide terminal
    const term = require("node-pty").spawn(command, args, {
      name: "xterm-color",
      cols: 200, // controls wrapping width
      rows: 40,
      cwd: process.cwd(),
      env: process.env,
    });
    term.onData((data) => {
      output += data;
    });
    term.onExit(({ exitCode }) => {
      if (exitCode === 0) {
        resolve(output);
      } else {
        reject(new Error(`${command} exited with ${exitCode}`));
      }
    });
  });
}
