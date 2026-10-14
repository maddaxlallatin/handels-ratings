"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectDatabase, db } from "../prisma/db.ts";
import { BASES, isBaseId } from "../lib/bases.ts";
import { slugify } from "../lib/catalog.ts";
import { loadCrew } from "../lib/data.ts";
import { isVisitDate } from "../lib/format.ts";
import { clearSession, readSessionUserId, setSession } from "../lib/session.ts";

export type ActionState = { error?: string };

async function requireUserId(): Promise<number | ActionState> {
  const userId = await readSessionUserId();
  if (!userId) return { error: "Sign in with your name first." };
  return userId;
}

function uploadDir(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
}

function cleanName(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export async function signIn(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const name = cleanName(formData.get("name"));
  if (name.length < 1 || name.length > 40) {
    return { error: "Use a name between 1 and 40 characters." };
  }
  if (/[%_]/.test(name)) {
    return { error: "Skip percent signs and underscores in names." };
  }

  const { users } = await loadCrew();
  const existing = users.find((user) => user.name.toLowerCase() === name.toLowerCase());
  const user =
    existing ??
    (await db.orm.public.User.create({
      name,
    }));

  await setSession(user.id);
  redirect("/");
}

export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/");
}

export async function savePreferences(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  if (typeof userId !== "number") return userId;
  const { users } = await loadCrew();
  if (!users.some((user) => user.id === userId)) {
    return { error: "That person is not on the crew list." };
  }

  const next: Array<{ userId: number; base: string; kind: "like" | "dislike" }> = [];
  for (const base of BASES) {
    const value = formData.get(`base:${base.id}`);
    if (value === "like" || value === "dislike") {
      next.push({ userId, base: base.id, kind: value });
    } else if (value !== null && value !== "") {
      return { error: "Pick like, dislike, or neither." };
    }
  }

  await db.orm.public.Preference.where({ userId }).deleteAll();
  for (const preference of next) {
    await db.orm.public.Preference.create(preference);
  }

  revalidatePath(`/people/${userId}`);
  revalidatePath("/recommend");
  redirect(`/people/${userId}`);
}

export async function addFlavor(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const signedIn = await requireUserId();
  if (typeof signedIn !== "number") return signedIn;
  const name = cleanName(formData.get("name"));
  const description = cleanName(formData.get("description"));
  if (name.length < 2 || name.length > 80) {
    return { error: "Flavor names need 2 to 80 characters." };
  }
  if (description.length < 2 || description.length > 280) {
    return { error: "Add a short description, up to 280 characters." };
  }

  const bases = formData
    .getAll("bases")
    .filter((value): value is string => typeof value === "string" && isBaseId(value));
  if (bases.length === 0) {
    return { error: "Pick at least one base flavor so recommendations can use it." };
  }

  const { flavors } = await loadCrew();
  const slug = slugify(name);
  if (flavors.some((flavor) => flavor.slug === slug || flavor.name.toLowerCase() === name.toLowerCase())) {
    return { error: "That flavor is already on the menu." };
  }

  const created = await db.orm.public.Flavor.create({
    name,
    slug,
    description,
    available: formData.get("available") === "on",
    bases,
  });

  revalidatePath("/flavors");
  redirect(`/flavors/${created.slug}`);
}

export async function toggleAvailability(formData: FormData): Promise<void> {
  const signedIn = await readSessionUserId();
  if (!signedIn) return;
  await connectDatabase();
  const id = Number(formData.get("flavorId"));
  if (!Number.isInteger(id)) return;
  const flavor = await db.orm.public.Flavor.where({ id }).first();
  if (!flavor) return;
  await db.orm.public.Flavor.where({ id }).update({ available: !flavor.available });
  revalidatePath("/flavors");
  revalidatePath(`/flavors/${flavor.slug}`);
  revalidatePath("/recommend");
}

export async function renameAccount(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  if (typeof userId !== "number") return userId;
  const name = cleanName(formData.get("name"));
  if (name.length < 1 || name.length > 40) {
    return { error: "Use a name between 1 and 40 characters." };
  }
  if (/[%_]/.test(name)) {
    return { error: "Skip percent signs and underscores in names." };
  }

  const { users } = await loadCrew();
  const taken = users.find((user) => user.id !== userId && user.name.toLowerCase() === name.toLowerCase());
  if (taken) return { error: "Someone already uses that name." };

  await db.orm.public.User.where({ id: userId }).update({ name });
  revalidatePath("/");
  revalidatePath("/people");
  revalidatePath(`/people/${userId}`);
  redirect(`/people/${userId}`);
}

export async function addReview(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  if (typeof userId !== "number") return userId;
  const parsed = readReviewFields(formData);
  if ("error" in parsed) return parsed;

  const { users, flavors } = await loadCrew();
  const user = users.find((item) => item.id === userId);
  const flavor = flavors.find((item) => item.id === parsed.flavorId);
  if (!user || !flavor) return { error: "That flavor or person is missing." };

  const stored = await storeImage(parsed.image);
  if ("error" in stored) return stored;

  await db.orm.public.Review.create({
    userId,
    flavorId: parsed.flavorId,
    score: parsed.score,
    note: parsed.note,
    visitedOn: parsed.visitedOn,
    ...(stored.path ? { imagePath: stored.path } : {}),
  });

  refreshReviewPages(flavor.slug, user.id);
  redirect(`/flavors/${flavor.slug}`);
}

export async function updateReview(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const userId = await requireUserId();
  if (typeof userId !== "number") return userId;
  const reviewId = Number(formData.get("reviewId"));
  if (!Number.isInteger(reviewId)) return { error: "That review is missing." };

  const parsed = readReviewFields(formData);
  if ("error" in parsed) return parsed;

  const review = await db.orm.public.Review.where({ id: reviewId }).first();
  if (!review || review.userId !== userId) return { error: "You can only edit your own reviews." };

  const { flavors } = await loadCrew();
  const flavor = flavors.find((item) => item.id === review.flavorId);
  if (!flavor) return { error: "That flavor is missing." };

  const stored = await storeImage(parsed.image);
  if ("error" in stored) return stored;

  const removeImage = formData.get("removeImage") === "on";
  const nextImage = stored.path ?? (removeImage ? null : review.imagePath);
  await db.orm.public.Review.where({ id: review.id }).update({
    score: parsed.score,
    note: parsed.note,
    visitedOn: parsed.visitedOn,
    imagePath: nextImage,
  });
  if (review.imagePath && review.imagePath !== nextImage) {
    await removeUpload(review.imagePath);
  }

  refreshReviewPages(flavor.slug, userId);
  const returnTo = formData.get("returnTo");
  redirect(returnTo === "profile" ? `/people/${userId}` : `/flavors/${flavor.slug}`);
}

function readReviewFields(formData: FormData): { error: string } | {
  flavorId: number;
  score: number;
  note: string;
  visitedOn: string;
  image: File | null;
} {
  const flavorId = Number(formData.get("flavorId"));
  const score = Number(formData.get("score"));
  const note = cleanName(formData.get("note"));
  const visitedOn = cleanName(formData.get("visitedOn"));
  if (!Number.isInteger(flavorId)) return { error: "Pick a flavor while you are signed in." };
  if (!Number.isInteger(score) || score < 1 || score > 10) return { error: "Score it from 1 to 10." };
  if (note.length < 2 || note.length > 1000) {
    return { error: "The note is required. A sentence or two is plenty." };
  }
  if (!isVisitDate(visitedOn)) return { error: "Pick the day you ate it." };
  const image = formData.get("image");
  return { flavorId, score, note, visitedOn, image: image instanceof File && image.size > 0 ? image : null };
}

async function storeImage(image: File | null): Promise<{ error: string } | { path?: string }> {
  if (!image) return {};
  if (image.size > 5 * 1024 * 1024) return { error: "Photos need to be 5 MB or smaller." };
  const extension = extensionFor(image);
  if (!extension) return { error: "Use a JPEG, PNG, WebP, or GIF." };
  const filename = `${randomUUID()}${extension}`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), filename), Buffer.from(await image.arrayBuffer()));
  return { path: filename };
}

function refreshReviewPages(slug: string, userId: number) {
  revalidatePath(`/flavors/${slug}`);
  revalidatePath(`/people/${userId}`);
  revalidatePath("/top");
  revalidatePath("/recommend");
  revalidatePath("/");
}

async function removeUpload(filename: string) {
  if (!/^[\w.-]+$/.test(filename)) return;
  await unlink(path.join(uploadDir(), filename)).catch(() => undefined);
}

function extensionFor(file: File): string | null {
  const byType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  if (byType[file.type]) return byType[file.type];
  const match = file.name.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/);
  if (!match) return null;
  return match[1] === "jpeg" ? ".jpg" : `.${match[1]}`;
}
