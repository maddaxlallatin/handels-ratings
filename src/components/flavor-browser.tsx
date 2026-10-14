"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleAvailability } from "@/app/actions";
import { baseLabel } from "@/lib/bases";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type FlavorCard = {
  id: number;
  slug: string;
  name: string;
  description: string;
  available: boolean;
  bases: string[];
  average: number | null;
  count: number;
};

export function FlavorBrowser({ flavors, signedIn }: { flavors: FlavorCard[]; signedIn: boolean }) {
  const [query, setQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const needle = query.trim().toLowerCase();
  const visible = flavors.filter((flavor) => {
    if (availableOnly && !flavor.available) return false;
    if (!needle) return true;
    return (
      flavor.name.toLowerCase().includes(needle) ||
      flavor.description.toLowerCase().includes(needle) ||
      flavor.bases.some((base) => base.includes(needle))
    );
  });

  return (
    <div className="space-y-3">
      <div className="sticky top-14 z-30 -mx-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="space-y-2">
          <Label htmlFor="flavor-search">Search</Label>
          <Input
            id="flavor-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pecan, chocolate, cookie…"
            enterKeyHint="search"
          />
        </div>
        <label className="flex min-h-11 items-center gap-3 text-base">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
          />
          Scooping now
        </label>
        <p className="text-sm text-muted-foreground">
          {visible.length} of {flavors.length}
        </p>
      </div>

      <ul className="space-y-3">
        {visible.map((flavor) => (
          <li key={flavor.id}>
            <Card className={flavor.available ? undefined : "opacity-70"}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">
                    <Link href={`/flavors/${flavor.slug}`} className="underline-offset-4 hover:underline">
                      {flavor.name}
                    </Link>
                  </CardTitle>
                  <Badge variant={flavor.available ? "default" : "secondary"}>
                    {flavor.available ? "Scooping" : "Off menu"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-base leading-relaxed text-muted-foreground">{flavor.description}</p>
                <p className="text-sm text-muted-foreground">{flavor.bases.map(baseLabel).join(" · ")}</p>
              </CardContent>
              <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  {flavor.count > 0 && flavor.average !== null
                    ? `${flavor.average.toFixed(1)} from ${flavor.count}`
                    : "No reviews yet"}
                </p>
                {signedIn ? (
                  <form action={toggleAvailability}>
                    <input type="hidden" name="flavorId" value={flavor.id} />
                    <Button type="submit" variant="outline" className="w-full sm:w-auto">
                      {flavor.available ? "Mark unavailable" : "Mark scooping"}
                    </Button>
                  </form>
                ) : null}
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
