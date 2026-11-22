import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addItemToCart,
  updateCartQty,
  computeCartTotals,
  countCustomBoxBottles,
  formatCustomBoxSummary,
  validateCheckout,
  validateRegistration,
  PACK_PRICES,
} from './blendyStore';

test('cart addition, incrementing, and removal behave accurately', () => {
  let cart = addItemToCart([], {
    id: 'peach-single',
    flavour: 'peach',
    title: 'Peach Tonic',
    subtitle: 'Single 250 ml',
    packSize: 'single',
    unitPrice: PACK_PRICES.single,
  });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 1);

  cart = addItemToCart(cart, {
    id: 'peach-single',
    flavour: 'peach',
    title: 'Peach Tonic',
    subtitle: 'Single 250 ml',
    packSize: 'single',
    unitPrice: PACK_PRICES.single,
  });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].qty, 2);

  cart = updateCartQty(cart, 'peach-single', -2);
  assert.equal(cart.length, 0);
});

test('shipping fee drops to zero at $35 threshold', () => {
  const below = computeCartTotals([
    {
      id: 'yuzu-pack6',
      flavour: 'yuzu',
      title: 'Yuzu Tonic',
      subtitle: '6-Pack',
      packSize: 'pack6',
      unitPrice: 24,
      qty: 1,
    },
  ]);
  assert.equal(below.subtotal, 24);
  assert.equal(below.shipping, 5);
  assert.equal(below.total, 29);
  assert.equal(below.remainingForFreeShipping, 11);

  const above = computeCartTotals([
    {
      id: 'matcha-pack12',
      flavour: 'matcha',
      title: 'Matcha Tonic',
      subtitle: '12-Pack',
      packSize: 'pack12',
      unitPrice: 44,
      qty: 1,
    },
  ]);
  assert.equal(above.subtotal, 44);
  assert.equal(above.shipping, 0);
  assert.equal(above.total, 44);
  assert.equal(above.remainingForFreeShipping, 0);
});

test('custom 6-pack counter and summary format match selection', () => {
  const mix = {peach: 2, yuzu: 2, matcha: 1, grapefruit: 1};
  assert.equal(countCustomBoxBottles(mix), 6);
  assert.equal(
    formatCustomBoxSummary(mix),
    '2× Peach, 2× Yuzu, 1× Matcha, 1× Grapefruit',
  );
});

test('checkout and registration validators catch missing or malformed fields', () => {
  assert.ok(validateCheckout({name: '', email: 'a@b.com', address: '123 Main', postal: '94107'}));
  assert.ok(validateCheckout({name: 'Ada', email: 'bad', address: '123 Main', postal: '94107'}));
  assert.equal(
    validateCheckout({name: 'Ada', email: 'ada@blendy.co', address: '123 Orchard Ln', postal: '94107'}),
    null,
  );

  assert.ok(validateRegistration({name: 'Ada', email: 'ada@blendy.co', password: '123'}));
  assert.equal(
    validateRegistration({name: 'Ada', email: 'ada@blendy.co', password: 'secret123'}),
    null,
  );
});
