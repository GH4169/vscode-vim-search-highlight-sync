#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
bash package.sh
code --install-extension "dist/local.vim-search-highlight-sync-0.1.0.vsix" --force
printf 'Merge config snippets on the Code UI host; reload the window manually when ready.\n'
