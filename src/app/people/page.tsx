import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseLabel } from "@/lib/bases";
import { loadCrew } from "@/lib/data";

export default async function PeoplePage() {
  const { users, reviews, preferences } = await loadCrew();

  return (
    <div className="space-y-5">
      <PageIntro eyebrow="Crew" title="Everyone with a name on the book." />
      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nobody has signed in yet.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((user) => {
            const count = reviews.filter((review) => review.userId === user.id).length;
            const likes = preferences
              .filter((preference) => preference.userId === user.id && preference.kind === "like")
              .map((preference) => baseLabel(preference.base));
            return (
              <li key={user.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <Link href={`/people/${user.id}`}>{user.name}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{count === 1 ? "1 review" : `${count} reviews`}</p>
                    <div className="flex flex-wrap gap-2">
                      {likes.length > 0 ? (
                        likes.map((like) => (
                          <Badge key={like} variant="secondary">
                            {like}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No likes picked yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
