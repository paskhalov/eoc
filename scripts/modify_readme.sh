#!/usr/bin/env bash

# SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
# SPDX-License-Identifier: MIT

trap 'echo "FAILED AT: $BASH_COMMAND" with $?' ERR
set -euxo pipefail
eoc --help
script -qefc "stty cols 1000 rows 1000; eoc --help" | tr -d '\r' > /tmp/HELP_TEXT
script -qefc "stty cols 1000 rows 1000; ./scripts/markdown_from_help.js commands /tmp/HELP_TEXT" | tr -d '\r' > /tmp/COMMANDS_TEXT
script -qefc "stty cols 1000 rows 1000;./scripts/modify_readme.js commands /tmp/COMMANDS_TEXT README.md" | tr -d '\r' > /tmp/README.md
cp /tmp/README.md README.md
git config --global user.email "actions@users.noreply.github.com"
git config --global user.name "modifyreadmy-bot"
git add README.md
git commit -m "sections in README have been modifed [skip ci]" || exit 0
git push
