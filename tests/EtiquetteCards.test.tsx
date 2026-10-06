import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EtiquetteCards } from '../src/components/EtiquetteCards.js';

test('hides the etiquette section when the invitation disables it', () => {
  const markup = renderToStaticMarkup(
    <EtiquetteCards {...({ isVisible: false } as Record<string, unknown>)} />
  );

  assert.doesNotMatch(markup, /id="wedding-etiquette-section"/);
});
