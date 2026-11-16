'use strict';
function install(proto, visibleEditors) {
  const original = proto.updateSearchHighlights;
  if (typeof original !== 'function')
    throw new Error('updateSearchHighlights is unavailable');
  let cache = new WeakMap(),
    refreshing = false;
  const handlers = new Set();
  function wrapped(show) {
    if (refreshing) return original.call(this, show);
    handlers.add(this);
    refreshing = true;
    const state = this.vimState,
      savedEditor = state.editor;
    try {
      for (const editor of visibleEditors().filter(
        (e) => e.document === savedEditor.document
      )) {
        state.editor = editor;
        this.searchDecorationCacheKey = cache.get(editor);
        original.call(this, show);
        cache.set(editor, this.searchDecorationCacheKey);
      }
      this.__searchSyncShow = show;
    } finally {
      state.editor = savedEditor;
      this.searchDecorationCacheKey = cache.get(savedEditor);
      refreshing = false;
    }
  }
  proto.updateSearchHighlights = wrapped;
  return {
    invalidate() {
      cache = new WeakMap();
      for (const handler of handlers)
        if (!handler.vimState.document.isClosed)
          wrapped.call(handler, handler.__searchSyncShow ?? false);
        else handlers.delete(handler);
    },
    dispose() {
      if (proto.updateSearchHighlights === wrapped)
        proto.updateSearchHighlights = original;
      handlers.clear();
    },
  };
}
module.exports = { install };
