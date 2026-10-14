import { SEED_FLAVORS, slugify } from "../lib/catalog.ts";
import { connectDatabase, db } from "./db.ts";

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();
  const existing = await db.orm.public.Flavor.select("slug").all();
  const have = new Set(existing.map((flavor) => flavor.slug));

  for (const flavor of SEED_FLAVORS) {
    const slug = slugify(flavor.name);
    if (have.has(slug)) continue;
    await db.orm.public.Flavor.create({
      name: flavor.name,
      slug,
      description: flavor.description,
      available: flavor.available,
      bases: [...flavor.bases],
    });
    have.add(slug);
  }
}

export function seedFlavors(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}

if (import.meta.main) {
  await seedFlavors();
  await db.close();
}
