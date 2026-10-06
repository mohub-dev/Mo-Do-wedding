import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { WeddingCard } from '../src/components/WeddingCard.js';
import { WeddingDataProvider } from '../src/context/WeddingDataContext.js';
import { INVITATION_DATA } from '../src/types.js';

test('renders the childhood couple portrait beneath the couple names', () => {
  const markup = renderToStaticMarkup(
    <WeddingDataProvider>
      <WeddingCard data={INVITATION_DATA} onReplay={() => undefined} />
    </WeddingDataProvider>
  );

  assert.match(markup, /src="\/assets\/couple-childhood-hug\.png"/);
  assert.match(markup, /alt="صورة طفولة العروسين"/);
});

test('renders the childhood-story caption beneath the portrait', () => {
  const markup = renderToStaticMarkup(
    <WeddingDataProvider>
      <WeddingCard data={INVITATION_DATA} onReplay={() => undefined} />
    </WeddingDataProvider>
  );

  assert.match(markup, /من هنا بدأت الحكاية… واليوم نبدأ أجمل فصولها معًا/);
});
