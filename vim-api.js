'use strict';
const vscode = require('vscode');
const path = require('node:path');
// VSCodeVim exposes this function from its CommonJS module, not activate().
// Requiring the cached entry does not modify its installed files.
async function getVim() {
  const ext = vscode.extensions.getExtension('vscodevim.vim');
  if (!ext || ext.packageJSON.version !== '1.32.4')
    throw new Error(
      'Only VSCodeVim 1.32.4 is supported; original behavior preserved.'
    );
  await ext.activate();
  const api = require(path.resolve(ext.extensionPath, ext.packageJSON.main));
  if (typeof api.getAndUpdateModeHandler !== 'function')
    throw new Error(
      'VSCodeVim private API changed; original behavior preserved.'
    );
  return api;
}
async function getHandler(api) {
  if (!vscode.window.activeTextEditor) return undefined;
  return api.getAndUpdateModeHandler();
}
module.exports = { getVim, getHandler };
