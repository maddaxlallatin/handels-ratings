import { AddFlavorForm } from "@/components/add-flavor-form";
import { FlavorBrowser } from "@/components/flavor-browser";
import { PageIntro } from "@/components/page-intro";
import { currentUser, loadCrew } from "@/lib/data";
import { scoreFlavors } from "@/lib/recommend";

export default async function FlavorsPage() {
  const [user, { flavors, reviews }] = await Promise.all([currentUser(), loadCrew()]);
  const scored = scoreFlavors(flavors, reviews);

  return (
    <div className="space-y-5">
      <PageIntro eyebrow="Menu" title="Every flavor on the card.">
        Everything starts as scooping now. Mark a flavor unavailable when the shop is out, or add one that isn’t listed.
      </PageIntro>
      <FlavorBrowser
        signedIn={Boolean(user)}
        flavors={scored.map((flavor) => ({
          id: flavor.id,
          slug: flavor.slug,
          name: flavor.name,
          description: flavor.description,
          available: flavor.available,
          bases: flavor.bases,
          average: flavor.average,
          count: flavor.count,
        }))}
      />
      {user ? (
        <AddFlavorForm />
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to add a flavor or change what’s scooping.</p>
      )}
    </div>
  );
}
