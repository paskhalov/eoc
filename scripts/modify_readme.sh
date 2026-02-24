#!/usr/bin/env bash

# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT

trap 'echo "FAILED AT: $BASH_COMMAND" with $?' ERR
set -euxo pipefail
eoc --help
COLUMNS=1000 script -e -q -c "eoc --help" > /tmp/HELP_TEXT
COLUMNS=1000 script -e -q -c "./scripts/markdown_from_help.js commands /tmp/HELP_TEXT" > /tmp/COMMANDS_TEXT
COLUMNS=1000 script -e -q -c "./scripts/modify_readme.js commands /tmp/COMMANDS_TEXT README.md" > /tmp/README.md
cp /tmp/README.md README.md
git config --global user.email "actions@users.noreply.github.com"
git config --global user.name "modifyreadmy-bot"
git add README.md
git commit -m "sections in README have been modifed [skip ci]" || exit 0
git push
