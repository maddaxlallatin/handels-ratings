import { cache } from "react";
import { connectDatabase, db } from "../prisma/db.ts";
import { seedFlavors } from "../prisma/seed.ts";
import { readSessionUserId } from "./session.ts";

async function ready(): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  await connectDatabase();
  await seedFlavors();
}

export const loadCrew = cache(async () => {
  await ready();
  const [users, flavors, reviews, preferences] = await Promise.all([
    db.orm.public.User.orderBy((user) => user.name.asc()).all(),
    db.orm.public.Flavor.orderBy((flavor) => flavor.name.asc()).all(),
    db.orm.public.Review.orderBy((review) => review.visitedOn.desc()).all(),
    db.orm.public.Preference.all(),
  ]);
  return { users, flavors, reviews, preferences };
});

export const currentUser = cache(async () => {
  if (!process.env.DATABASE_URL) return null;
  const userId = await readSessionUserId();
  if (!userId) return null;
  await ready();
  return db.orm.public.User.where({ id: userId }).first();
});

export async function flavorBySlug(slug: string) {
  const { flavors } = await loadCrew();
  return flavors.find((flavor) => flavor.slug === slug) ?? null;
}

export async function userById(id: number) {
  const { users } = await loadCrew();
  return users.find((user) => user.id === id) ?? null;
}
