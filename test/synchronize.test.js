'use strict';
const { test } = require('node:test'),
  assert = require('node:assert/strict');
const { install } = require('../synchronize');
test('per editor cache, invalidation, no focus changes and original restored', () => {
  const document = { version: 1 },
    a = { document },
    b = { document },
    calls = [];
  const proto = {
    updateSearchHighlights(show) {
      if (this.searchDecorationCacheKey?.version === document.version && show)
        return;
      calls.push([this.vimState.editor, show]);
      this.searchDecorationCacheKey = show
        ? { version: document.version }
        : undefined;
    },
  };
  const original = proto.updateSearchHighlights,
    h = Object.create(proto);
  h.vimState = { document, editor: a };
  const adapter = install(proto, () => [a, b]);
  h.updateSearchHighlights(true);
  h.updateSearchHighlights(true);
  assert.deepEqual(calls, [
    [a, true],
    [b, true],
  ]);
  assert.equal(h.vimState.editor, a);
  adapter.invalidate();
  assert.equal(calls.length, 4);
  h.updateSearchHighlights(false);
  assert.equal(calls.length, 6);
  adapter.dispose();
  assert.equal(proto.updateSearchHighlights, original);
});
