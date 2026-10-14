import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseLabel } from "@/lib/bases";
import { currentUser, loadCrew } from "@/lib/data";
import { recommendations, scoreFlavors, type Recommendation } from "@/lib/recommend";

export default async function RecommendPage() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="space-y-5">
        <PageIntro title="Sign in to get a scoop suggestion.">
          Recommendations use your likes, your dislikes, and flavors you have not reviewed yet.
        </PageIntro>
        <Button size="lg" className="w-full" asChild>
          <Link href="/">Pick your name</Link>
        </Button>
      </div>
    );
  }

  const { flavors, reviews, preferences } = await loadCrew();
  const mine = preferences.filter((preference) => preference.userId === user.id);
  const likes = new Set(mine.filter((preference) => preference.kind === "like").map((preference) => preference.base));
  const dislikes = new Set(
    mine.filter((preference) => preference.kind === "dislike").map((preference) => preference.base),
  );
  const reviewed = new Set(reviews.filter((review) => review.userId === user.id).map((review) => review.flavorId));
  const picks = recommendations({
    flavors: scoreFlavors(flavors, reviews),
    reviewedFlavorIds: reviewed,
    likes,
    dislikes,
  });

  return (
    <div className="space-y-5">
      <PageIntro eyebrow={`For ${user.name}`} title="Three ways to pick the next pint.">
        Only flavors marked scooping now, and only ones you have not reviewed.
      </PageIntro>
      <Button variant="outline" className="w-full" asChild>
        <Link href={`/people/${user.id}`}>Edit what you like</Link>
      </Button>
      <div className="flex flex-wrap gap-2">
        {[...likes].map((base) => (
          <Badge key={`like-${base}`}>Likes {baseLabel(base)}</Badge>
        ))}
        {[...dislikes].map((base) => (
          <Badge key={`dislike-${base}`} variant="secondary">
            Avoids {baseLabel(base)}
          </Badge>
        ))}
      </div>
      <RecommendationBlock
        title="Highly rated, still new to you"
        empty="Once the crew reviews a few flavors you haven’t tried, they’ll land here."
        items={picks.popular}
      />
      <RecommendationBlock
        title="Matches what you like"
        empty="Set a few likes on your profile. Suggestions skip bases you marked as dislikes."
        items={picks.preferred}
      />
      <RecommendationBlock
        title="Loved by the crew, and your kind of flavor"
        empty="This is the overlap: a strong average, tags you like, and nothing you dislike."
        items={picks.both}
      />
    </div>
  );
}

function RecommendationBlock({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Recommendation[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-balance">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.flavor.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link href={`/flavors/${item.flavor.slug}`}>{item.flavor.name}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-base leading-relaxed text-muted-foreground">{item.flavor.description}</p>
                  <p className="text-sm text-muted-foreground">{item.reason}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
