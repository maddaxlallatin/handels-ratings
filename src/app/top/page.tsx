import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { loadCrew } from "@/lib/data";
import { formatScore } from "@/lib/format";
import { scoreFlavors, topFlavors } from "@/lib/recommend";

export default async function TopPage() {
  const { flavors, reviews } = await loadCrew();
  const ranked = topFlavors(scoreFlavors(flavors, reviews));

  return (
    <div className="space-y-5">
      <PageIntro eyebrow="Leaderboard" title="Top reviewed flavors">
        Sorted by average score, then by how many people have weighed in.
      </PageIntro>
      {ranked.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ol className="space-y-3">
          {ranked.map((flavor, index) => (
            <li key={flavor.id}>
              <Card>
                <CardContent className="flex items-start gap-3">
                  <Badge className="mt-0.5 size-8 rounded-full p-0 text-sm">{index + 1}</Badge>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link href={`/flavors/${flavor.slug}`} className="text-lg font-semibold">
                      {flavor.name}
                    </Link>
                    <p className="text-sm leading-relaxed text-muted-foreground">{flavor.description}</p>
                  </div>
                  <p className="text-right">
                    <span className="block text-xl font-semibold">{formatScore(flavor.average ?? 0)}</span>
                    <span className="text-xs text-muted-foreground">{flavor.count}</span>
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
