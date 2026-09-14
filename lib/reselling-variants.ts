export type VariantOptions = Record<string, string>;

export type ResellingVariant = {
  id?: string;
  options: VariantOptions;
  price?: number | null;
  originalPrice?: number | null;
  sourcePrice?: number | null;
  currency?: string;
  stockStatus?: "in_stock" | "out_of_stock" | "limited" | "unknown";
  stockQuantity?: number | null;
  sku?: string | null;
  sourceVariantId?: string | null;
};

const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const canonicalKey = (options: VariantOptions) => Object.keys(options).sort().map((key) => `${key.toLowerCase()}=${options[key].trim().toLowerCase()}`).join("|");

export function parseEncodedVariant(value: unknown): { id?: string; options: VariantOptions; sourcePrice?: number | null; stockStatus?: ResellingVariant["stockStatus"]; stockQuantity?: number | null; sku?: string | null; sourceVariantId?: string | null } | null {
  const raw = clean(value);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.options && typeof parsed.options === "object") {
      const options: VariantOptions = {};
      for (const [key, item] of Object.entries(parsed.options)) if (clean(key) && clean(item)) options[clean(key)] = clean(item);
      if (Object.keys(options).length) return { id: clean(parsed.id) || undefined, options, sourcePrice: parsed.price == null ? null : Number(parsed.price), stockStatus: parsed.stockStatus, stockQuantity: parsed.stockQuantity == null ? null : Number(parsed.stockQuantity), sku: clean(parsed.sku) || null, sourceVariantId: clean(parsed.sourceVariantId) || null };
    }
  } catch {}
  const options: VariantOptions = {};
  const parts = raw.split("||").map((item) => item.trim()).filter(Boolean);
  for (const part of parts) {
    const separator = part.indexOf("=");
    if (separator <= 0) continue;
    const key = clean(part.slice(0, separator));
    const valuePart = clean(part.slice(separator + 1));
    if (key && valuePart) options[key] = valuePart;
  }
  return Object.keys(options).length ? { options } : null;
}

export function makeVariantId(options: VariantOptions, sourceVariantId?: string | null) {
  const seed = sourceVariantId?.trim() || canonicalKey(options);
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);
  return `v_${(hash >>> 0).toString(36)}`;
}

export function normalizeStoredVariants(input: unknown): ResellingVariant[] {
  if (!Array.isArray(input)) return [];
  const output: ResellingVariant[] = [];
  const seen = new Set<string>();
  const push = (variant: ResellingVariant) => {
    const key = canonicalKey(variant.options);
    if (!key || seen.has(key)) return;
    seen.add(key);
    output.push({ ...variant, id: variant.id || makeVariantId(variant.options, variant.sourceVariantId) });
  };
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    if (clean(item.name) === "__combo__" && Array.isArray(item.options)) {
      for (const encoded of item.options) {
        const parsed = parseEncodedVariant(encoded);
        if (parsed) push({ id: parsed.id, options: parsed.options, sourcePrice: parsed.sourcePrice, stockStatus: parsed.stockStatus, stockQuantity: parsed.stockQuantity, sku: parsed.sku, sourceVariantId: parsed.sourceVariantId });
      }
      continue;
    }
    if (item.options && !Array.isArray(item.options) && typeof item.options === "object") {
      const options: VariantOptions = {};
      for (const [key, value] of Object.entries(item.options as Record<string, unknown>)) if (clean(key) && clean(value)) options[clean(key)] = clean(value);
      if (Object.keys(options).length) push({ id: clean(item.id) || undefined, options, price: item.price == null ? null : Number(item.price), originalPrice: item.originalPrice == null ? null : Number(item.originalPrice), sourcePrice: item.sourcePrice == null ? null : Number(item.sourcePrice), currency: clean(item.currency) || undefined, stockStatus: item.stockStatus as ResellingVariant["stockStatus"], stockQuantity: item.stockQuantity == null ? null : Number(item.stockQuantity), sku: clean(item.sku) || null, sourceVariantId: clean(item.sourceVariantId) || null });
      continue;
    }
    const name = clean(item.name);
    const values = Array.isArray(item.options) ? item.options.map(clean).filter(Boolean) : [];
    if (name && values.length) for (const value of values) push({ options: { [name]: value }, price: null, stockStatus: "unknown", stockQuantity: null });
  }
  return output;
}

export function resolveVariant(input: unknown, variantId?: unknown): ResellingVariant | null {
  const variants = normalizeStoredVariants(input);
  const requestedId = clean(variantId);
  if (requestedId) return variants.find((variant) => variant.id === requestedId) || null;
  return null;
}

export function optionGroups(variants: unknown) {
  const groups = new Map<string, string[]>();
  for (const variant of normalizeStoredVariants(variants)) for (const [name, value] of Object.entries(variant.options)) {
    const values = groups.get(name) || [];
    if (!values.includes(value)) values.push(value);
    groups.set(name, values);
  }
  return Array.from(groups.entries()).map(([name, values]) => ({ name, values }));
}

export function isVariantInStock(variant: ResellingVariant | null) {
  if (!variant) return false;
  if (variant.stockStatus === "out_of_stock") return false;
  if (variant.stockQuantity != null && variant.stockQuantity <= 0) return false;
  return true;
}

export function variantMatchesSelection(variant: ResellingVariant, selected: VariantOptions) {
  const keys = Object.keys(variant.options);
  return keys.length === Object.keys(selected).length && keys.every((key) => variant.options[key] === selected[key]);
}

export function optionValueIsPossible(variants: unknown, selected: VariantOptions, group: string, value: string) {
  return normalizeStoredVariants(variants).some((variant) => {
    if (!isVariantInStock(variant)) return false;
    if (variant.options[group] !== value) return false;
    return Object.entries(selected).every(([key, selectedValue]) => key === group || variant.options[key] === selectedValue);
  });
}
