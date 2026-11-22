export type FlavourId = 'peach' | 'yuzu' | 'matcha' | 'grapefruit';
export type PackSize = 'single' | 'pack6' | 'pack12';

export interface CartItem {
  id: string;
  flavour: FlavourId | 'custom';
  title: string;
  subtitle: string;
  packSize: PackSize;
  unitPrice: number;
  qty: number;
}

export const PACK_PRICES: Record<PackSize, number> = {
  single: 4.5,
  pack6: 24.0,
  pack12: 44.0,
};

export const FREE_SHIPPING_THRESHOLD = 35.0;
export const SHIPPING_FEE = 5.0;

export function addItemToCart(
  cart: readonly CartItem[],
  incoming: Omit<CartItem, 'qty'>,
  qty = 1,
): CartItem[] {
  const existing = cart.find((item) => item.id === incoming.id);
  if (existing) {
    return cart.map((item) =>
      item.id === incoming.id ? {...item, qty: item.qty + qty} : item,
    );
  }
  return [...cart, {...incoming, qty}];
}

export function updateCartQty(
  cart: readonly CartItem[],
  id: string,
  delta: number,
): CartItem[] {
  return cart
    .map((item) => (item.id === id ? {...item, qty: item.qty + delta} : item))
    .filter((item) => item.qty > 0);
}

export function computeCartTotals(cart: readonly CartItem[]): {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  remainingForFreeShipping: number;
} {
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = Number(
    cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0).toFixed(2),
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = Number((subtotal + shipping).toFixed(2));
  const remainingForFreeShipping = Number(
    Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2),
  );
  return {itemCount, subtotal, shipping, total, remainingForFreeShipping};
}

export function countCustomBoxBottles(counts: Record<FlavourId, number>): number {
  return counts.peach + counts.yuzu + counts.matcha + counts.grapefruit;
}

export function formatCustomBoxSummary(counts: Record<FlavourId, number>): string {
  const labels: Array<[FlavourId, string]> = [
    ['peach', 'Peach'],
    ['yuzu', 'Yuzu'],
    ['matcha', 'Matcha'],
    ['grapefruit', 'Grapefruit'],
  ];
  return labels
    .filter(([id]) => counts[id] > 0)
    .map(([id, name]) => `${counts[id]}× ${name}`)
    .join(', ');
}

export interface CheckoutInput {
  name: string;
  email: string;
  address: string;
  postal: string;
}

export function validateCheckout(input: CheckoutInput): string | null {
  if (!input.name.trim()) return 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (input.address.trim().length < 5) {
    return 'Please enter a delivery street address.';
  }
  if (input.postal.trim().length < 3) {
    return 'Please enter a valid postal code.';
  }
  return null;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export function validateRegistration(input: RegisterInput): string | null {
  if (!input.name.trim()) return 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return 'Please enter a valid email address.';
  }
  if (input.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}
