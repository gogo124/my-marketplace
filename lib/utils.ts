export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 0
  }).format(price)} DH`;
}

export function serializeDocument<T>(document: T): T {
  return JSON.parse(JSON.stringify(document));
}
