import type { SchemaNode } from "./core";

export interface ItemListEntry {
  url: string;
  name?: string;
}

/**
 * ItemList node. Pagination-aware: pass startPosition so paginated lists
 * emit globally-correct positions (page 2 starts at pageSize + 1, etc.).
 */
export function buildItemList(
  items: ItemListEntry[],
  startPosition = 1,
): SchemaNode {
  return {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => {
      const entry: SchemaNode = {
        "@type": "ListItem",
        position: startPosition + i,
        url: item.url,
      };
      if (item.name) entry.name = item.name;
      return entry;
    }),
  };
}
