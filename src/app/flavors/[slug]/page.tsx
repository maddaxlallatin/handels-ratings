import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ReviewForm } from "@/components/review-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toggleAvailability } from "@/app/actions";
import { baseLabel } from "@/lib/bases";
import { currentUser, flavorBySlug, loadCrew } from "@/lib/data";
import { formatScore, formatVisit } from "@/lib/format";

export default async function FlavorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [user, flavor, { users, reviews }] = await Promise.all([currentUser(), flavorBySlug(slug), loadCrew()]);
  if (!flavor) notFound();

  const people = new Map(users.map((person) => [person.id, person]));
  const flavorReviews = reviews.filter((review) => review.flavorId === flavor.id);
  const average =
    flavorReviews.length === 0
      ? null
      : flavorReviews.reduce((sum, review) => sum + review.score, 0) / flavorReviews.length;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <PageIntro eyebrow={flavor.available ? "Scooping now" : "Off the menu"} title={flavor.name}>
          {flavor.description}
        </PageIntro>
        <div className="flex flex-wrap gap-2">
          {flavor.bases.map((base) => (
            <Badge key={base} variant="secondary">
              {baseLabel(base)}
            </Badge>
          ))}
        </div>
        <p className="text-base font-medium">
          {average === null
            ? "No scores yet"
            : `${formatScore(average)} average · ${flavorReviews.length} ${flavorReviews.length === 1 ? "review" : "reviews"}`}
        </p>
        {user ? (
          <form action={toggleAvailability}>
            <input type="hidden" name="flavorId" value={flavor.id} />
            <Button type="submit" variant="outline" className="w-full">
              {flavor.available ? "Mark unavailable" : "Mark scooping"}
            </Button>
          </form>
        ) : null}
      </div>

      {user ? <ReviewForm flavorId={flavor.id} /> : <p className="text-sm text-muted-foreground">Sign in to leave a score.</p>}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {flavorReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Be the first to write this one up.</p>
        ) : (
          flavorReviews.map((review) => {
            const person = people.get(review.userId);
            return (
              <Card key={review.id}>
                <CardHeader className="flex-row items-center justify-between gap-3">
                  <p className="text-2xl font-semibold">{review.score}/10</p>
                  <p className="text-right text-sm text-muted-foreground">
                    <Link href={person ? `/people/${person.id}` : "/people"} className="font-medium text-foreground">
                      {person?.name ?? "Someone"}
                    </Link>
                    <br />
                    {formatVisit(review.visitedOn)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-base leading-relaxed">{review.note}</p>
                  {review.imagePath ? (
                    <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                      <Image
                        src={`/media/${review.imagePath}`}
                        alt={`Photo from a ${flavor.name} review`}
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
