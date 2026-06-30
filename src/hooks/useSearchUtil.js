import Fuse from "fuse.js";

const FUSE_OPTIONS = {
  keys: [{ name: "name", weight: 0.6 }],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
};

export function buildExtendedQuery(searchQuery) {
  const tokens = searchQuery.trim().split(/\s+/).filter(Boolean);
  return tokens.map((t) => `'${t}`).join(" ");
}

export function searchProducts(products, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) return products;

  const fuse = new Fuse(products, FUSE_OPTIONS);
  const extendedQuery = buildExtendedQuery(searchQuery);
  return fuse.search(extendedQuery).map((result) => result.item);
}