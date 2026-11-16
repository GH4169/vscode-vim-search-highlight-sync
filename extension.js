'use strict';
const vscode = require('vscode');
const { getVim, getHandler } = require('./vim-api');
const { install } = require('./synchronize');
async function activate(context) {
  const output = vscode.window.createOutputChannel('Vim Search Sync');
  context.subscriptions.push(output);
  try {
    const api = await getVim();
    let adapter, timer;
    async function refresh() {
      if (!adapter && vscode.window.activeTextEditor) {
        const h = await getHandler(api);
        if (h && !adapter) {
          adapter = install(
            Object.getPrototypeOf(h),
            () => vscode.window.visibleTextEditors
          );
          context.subscriptions.push(adapter);
          output.appendLine('VSCodeVim 1.32.4 search adapter active.');
        }
      }
      adapter?.invalidate();
    }
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(
        () => refresh().catch((e) => output.appendLine(e.stack)),
        25
      );
    };
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(schedule),
      vscode.window.onDidChangeVisibleTextEditors(schedule),
      vscode.workspace.onDidChangeTextDocument(schedule),
      vscode.workspace.onDidChangeConfiguration(schedule),
      {
        dispose() {
          clearTimeout(timer);
        },
      }
    );
    await refresh();
  } catch (error) {
    output.appendLine(error.message);
  }
}
module.exports = { activate };
