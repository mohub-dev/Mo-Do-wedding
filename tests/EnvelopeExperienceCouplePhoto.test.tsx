import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { EnvelopeExperience } from '../src/components/EnvelopeExperience.js';

test('renders the childhood couple portrait as an envelope reveal layer', () => {
  const markup = renderToStaticMarkup(
    <EnvelopeExperience onOpened={() => undefined} />
  );

  assert.match(markup, /id="emerging-couple-photo"/);
  assert.match(markup, /src="\/assets\/couple-childhood-hug\.png"/);
  assert.match(markup, /alt="صورة طفولة العروسين تخرج من ظرف الدعوة"/);
});
