import pg from "pg";
import { SEED_FLAVORS, slugify } from "../lib/catalog.ts";
import { connectDatabase, db } from "./db.ts";

const scoopingDefault = "all-flavors-scooping";

let pendingSeed: Promise<void> | undefined;

async function markExistingFlavorsScooping(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const current = await client.query<{ comment: string | null }>(
      `SELECT obj_description('public."Flavor"'::regclass) AS comment`,
    );
    if (current.rows[0]?.comment === scoopingDefault) return;

    await client.query(`UPDATE "Flavor" SET available = true WHERE available = false`);
    await client.query(`COMMENT ON TABLE "Flavor" IS 'all-flavors-scooping'`);
  } finally {
    await client.end();
  }
}

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

  await markExistingFlavorsScooping();
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
