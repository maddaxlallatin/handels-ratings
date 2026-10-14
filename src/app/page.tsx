import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SignInForm } from "@/components/sign-in-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser, loadCrew } from "@/lib/data";
import { formatScore, formatVisit } from "@/lib/format";
import { scoreFlavors, topFlavors } from "@/lib/recommend";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="space-y-6">
        <PageIntro eyebrow="Weekly scoops" title="Who’s at the counter?">
          Pick your name and this phone will keep signing you in. Add yourself if this is your first visit.
        </PageIntro>
        <SignInForm />
        <Button variant="outline" className="w-full" asChild>
          <Link href="/flavors">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  const { users, flavors, reviews } = await loadCrew();
  const byId = new Map(users.map((person) => [person.id, person]));
  const flavorById = new Map(flavors.map((flavor) => [flavor.id, flavor]));
  const ranked = topFlavors(scoreFlavors(flavors, reviews)).slice(0, 5);
  const mine = reviews.filter((review) => review.userId === user.id);
  const latest = reviews.slice(0, 6);

  return (
    <div className="space-y-5">
      <PageIntro eyebrow="Signed in" title={`Hey, ${user.name}.`}>
        Log what you ate this week, then see how the crew ranked it.
      </PageIntro>
      <div className="grid gap-2">
        <Button size="lg" className="w-full" asChild>
          <Link href="/flavors">Log a scoop</Link>
        </Button>
        <Button size="lg" variant="outline" className="w-full" asChild>
          <Link href="/recommend">What to try</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crew leaders</CardTitle>
        </CardHeader>
        <CardContent>
          {ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground">Rankings show up after the first reviews.</p>
          ) : (
            <ol className="divide-y">
              {ranked.map((flavor, index) => (
                <li key={flavor.id} className="flex items-center justify-between gap-3 py-3 text-base">
                  <Link href={`/flavors/${flavor.slug}`} className="min-w-0 truncate font-medium">
                    {index + 1}. {flavor.name}
                  </Link>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {formatScore(flavor.average ?? 0)} · {flavor.count}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your latest</CardTitle>
        </CardHeader>
        <CardContent>
          {mine.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven’t logged a flavor yet.</p>
          ) : (
            <ul className="divide-y">
              {mine.slice(0, 5).map((review) => {
                const flavor = flavorById.get(review.flavorId);
                return (
                  <li key={review.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={flavor ? `/flavors/${flavor.slug}` : "/flavors"} className="min-w-0 truncate font-medium">
                      {flavor?.name ?? "Flavor"}
                    </Link>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {review.score}/10 · {formatVisit(review.visitedOn)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent from the crew</CardTitle>
        </CardHeader>
        <CardContent>
          {latest.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody has written a review yet.</p>
          ) : (
            <ul className="divide-y">
              {latest.map((review) => {
                const person = byId.get(review.userId);
                const flavor = flavorById.get(review.flavorId);
                return (
                  <li key={review.id} className="space-y-1 py-3 text-base">
                    <p>
                      <Link href={person ? `/people/${person.id}` : "/people"} className="font-medium">
                        {person?.name ?? "Someone"}
                      </Link>{" "}
                      scored{" "}
                      <Link href={flavor ? `/flavors/${flavor.slug}` : "/flavors"} className="font-medium">
                        {flavor?.name ?? "a flavor"}
                      </Link>{" "}
                      {review.score}/10
                    </p>
                    <p className="text-sm text-muted-foreground">{formatVisit(review.visitedOn)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
