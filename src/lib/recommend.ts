export type FlavorScore = {
  id: number;
  slug: string;
  name: string;
  description: string;
  available: boolean;
  bases: string[];
  average: number | null;
  count: number;
};

export type Recommendation = {
  flavor: FlavorScore;
  reason: string;
};

function average(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function scoreFlavors(
  flavors: Array<{
    id: number;
    slug: string;
    name: string;
    description: string;
    available: boolean;
    bases: readonly string[];
  }>,
  reviews: Array<{ flavorId: number; score: number }>,
): FlavorScore[] {
  const byFlavor = new Map<number, number[]>();
  for (const review of reviews) {
    const scores = byFlavor.get(review.flavorId) ?? [];
    scores.push(review.score);
    byFlavor.set(review.flavorId, scores);
  }

  return flavors.map((flavor) => {
    const scores = byFlavor.get(flavor.id) ?? [];
    return {
      id: flavor.id,
      slug: flavor.slug,
      name: flavor.name,
      description: flavor.description,
      available: flavor.available,
      bases: [...flavor.bases],
      average: average(scores),
      count: scores.length,
    };
  });
}

function byRating(left: FlavorScore, right: FlavorScore): number {
  return (right.average ?? 0) - (left.average ?? 0) || right.count - left.count || left.name.localeCompare(right.name);
}

export function topFlavors(flavors: FlavorScore[]): FlavorScore[] {
  return flavors.filter((flavor) => flavor.count > 0).sort(byRating);
}

export function recommendations(input: {
  flavors: FlavorScore[];
  reviewedFlavorIds: ReadonlySet<number>;
  likes: ReadonlySet<string>;
  dislikes: ReadonlySet<string>;
}): { popular: Recommendation[]; preferred: Recommendation[]; both: Recommendation[] } {
  const untried = input.flavors.filter(
    (flavor) => flavor.available && !input.reviewedFlavorIds.has(flavor.id),
  );

  const popular = untried
    .filter((flavor) => flavor.count > 0)
    .sort(byRating)
    .slice(0, 6)
    .map((flavor) => ({
      flavor,
      reason: `${flavor.average?.toFixed(1)} average from ${flavor.count} ${flavor.count === 1 ? "review" : "reviews"}`,
    }));

  const preferred = untried
    .map((flavor) => {
      const matches = flavor.bases.filter((base) => input.likes.has(base));
      const blocked = flavor.bases.some((base) => input.dislikes.has(base));
      return { flavor, matches, blocked };
    })
    .filter((item) => !item.blocked && item.matches.length > 0)
    .sort(
      (left, right) =>
        right.matches.length - left.matches.length || byRating(left.flavor, right.flavor),
    )
    .slice(0, 6)
    .map((item) => ({
      flavor: item.flavor,
      reason: `Shares ${item.matches.join(", ")}`,
    }));

  const both = untried
    .map((flavor) => {
      const matches = flavor.bases.filter((base) => input.likes.has(base));
      const blocked = flavor.bases.some((base) => input.dislikes.has(base));
      return { flavor, matches, blocked };
    })
    .filter((item) => !item.blocked && item.matches.length > 0 && item.flavor.count > 0)
    .sort(
      (left, right) =>
        byRating(left.flavor, right.flavor) || right.matches.length - left.matches.length,
    )
    .slice(0, 6)
    .map((item) => ({
      flavor: item.flavor,
      reason: `${item.flavor.average?.toFixed(1)} average, and it lines up with ${item.matches.join(", ")}`,
    }));

  return { popular, preferred, both };
}
