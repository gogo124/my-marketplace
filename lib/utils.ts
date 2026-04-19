export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(price);
}

export function serializeDocument<T>(document: T): T {
  return JSON.parse(JSON.stringify(document));
}
