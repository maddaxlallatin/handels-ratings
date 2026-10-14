export const BASES = [
  { id: "chocolate", label: "Chocolate" },
  { id: "vanilla", label: "Vanilla" },
  { id: "strawberry", label: "Strawberry" },
  { id: "peanut butter", label: "Peanut butter" },
  { id: "coffee", label: "Coffee" },
  { id: "mint", label: "Mint" },
  { id: "caramel", label: "Caramel" },
  { id: "cookie", label: "Cookie & dough" },
  { id: "fruit", label: "Fruit" },
  { id: "nut", label: "Nuts" },
  { id: "candy", label: "Candy" },
  { id: "cake", label: "Cake & cheesecake" },
  { id: "coconut", label: "Coconut" },
] as const;

export type BaseId = (typeof BASES)[number]["id"];

const baseIds = new Set<string>(BASES.map((base) => base.id));

export function isBaseId(value: string): value is BaseId {
  return baseIds.has(value);
}

export function baseLabel(id: string): string {
  return BASES.find((base) => base.id === id)?.label ?? id;
}
