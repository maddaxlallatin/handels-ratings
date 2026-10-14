import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { PreferenceForm } from "@/components/preference-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseLabel } from "@/lib/bases";
import { currentUser, loadCrew, userById } from "@/lib/data";
import { formatScore, formatVisit } from "@/lib/format";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) notFound();

  const [viewer, person, { flavors, reviews, preferences }] = await Promise.all([
    currentUser(),
    userById(personId),
    loadCrew(),
  ]);
  if (!person) notFound();

  const flavorById = new Map(flavors.map((flavor) => [flavor.id, flavor]));
  const mine = reviews.filter((review) => review.userId === person.id);
  const theirs = preferences.filter((preference) => preference.userId === person.id);
  const likes = theirs.filter((preference) => preference.kind === "like").map((preference) => preference.base);
  const dislikes = theirs.filter((preference) => preference.kind === "dislike").map((preference) => preference.base);

  const byFlavor = new Map<number, { total: number; count: number }>();
  for (const review of mine) {
    const current = byFlavor.get(review.flavorId) ?? { total: 0, count: 0 };
    current.total += review.score;
    current.count += 1;
    byFlavor.set(review.flavorId, current);
  }
  const rankings = [...byFlavor.entries()]
    .map(([flavorId, stats]) => ({
      flavor: flavorById.get(flavorId),
      average: stats.total / stats.count,
      count: stats.count,
    }))
    .filter((row) => row.flavor)
    .sort(
      (left, right) =>
        right.average - left.average || right.count - left.count || left.flavor!.name.localeCompare(right.flavor!.name),
    );

  return (
    <div className="space-y-5">
      <PageIntro eyebrow="Profile" title={person.name}>
        {mine.length === 1 ? "1 review" : `${mine.length} reviews`} logged.
      </PageIntro>

      <div className="grid gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Likes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {likes.length > 0 ? (
              likes.map((base) => <Badge key={base}>{baseLabel(base)}</Badge>)
            ) : (
              <p className="text-sm text-muted-foreground">Nothing marked yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dislikes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {dislikes.length > 0 ? (
              dislikes.map((base) => (
                <Badge key={base} variant="secondary">
                  {baseLabel(base)}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nothing marked yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {viewer?.id === person.id ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Your flavor preferences</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Everyone can see these. They drive the “for you” suggestions.
          </p>
          <PreferenceForm userId={person.id} likes={likes} dislikes={dislikes} />
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Flavor rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scores yet.</p>
          ) : (
            <ol className="divide-y">
              {rankings.map((row) => (
                <li key={row.flavor!.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/flavors/${row.flavor!.slug}`} className="min-w-0 truncate font-medium">
                    {row.flavor!.name}
                  </Link>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {formatScore(row.average)} · {row.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Review history</h2>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits logged.</p>
        ) : (
          mine.map((review) => {
            const flavor = flavorById.get(review.flavorId);
            return (
              <Card key={review.id}>
                <CardHeader className="gap-1">
                  <CardTitle className="text-lg">
                    <Link href={flavor ? `/flavors/${flavor.slug}` : "/flavors"}>{flavor?.name ?? "Flavor"}</Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {review.score}/10 · {formatVisit(review.visitedOn)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-base leading-relaxed">{review.note}</p>
                  {review.imagePath ? (
                    <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                      <Image
                        src={`/media/${review.imagePath}`}
                        alt={flavor ? `Photo of ${flavor.name}` : "Review photo"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
