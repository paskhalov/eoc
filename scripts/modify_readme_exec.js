#!/usr/bin/env node
/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require("fs");
const assert = require('assert');
const { parseCommandsBlock } = require("./markdown_from_help");
const { captureCommandOutput } = require("./capture_output");

(async function (){
    
    let tmp_data = {};
    let help_text = await captureCommandOutput("eoc", ["--help"]);
    help_text = help_text.replace(/\r\n/g, "\n");
    assert.ok(["Options:","Commands:"].every(sub => help_text.includes(sub)),'"eoc --help" should includes Commands and Options');
    
    tmp_data['HELP_TEXT'] = help_text;
    const res = parseCommandsBlock(['Commands:','Command'],help_text);
    console.log(res);
    fs.writeFileSync('/tmp/COMMANDS_MARKDOWN', res);
    
})();
