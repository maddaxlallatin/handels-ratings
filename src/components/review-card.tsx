"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ReviewForm, type ReviewDraft } from "@/components/review-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatVisit } from "@/lib/format";

export function ReviewCard({
  review,
  flavorId,
  flavorSlug,
  flavorName,
  authorId,
  authorName,
  imageAlt,
  canEdit,
  returnTo,
}: {
  review: ReviewDraft;
  flavorId: number;
  flavorSlug: string;
  flavorName: string;
  authorId?: number;
  authorName: string;
  imageAlt: string;
  canEdit: boolean;
  returnTo: "flavor" | "profile";
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <ReviewForm
        flavorId={flavorId}
        review={review}
        returnTo={returnTo}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        {returnTo === "profile" ? (
          <>
            <CardTitle className="text-lg">
              <Link href={`/flavors/${flavorSlug}`}>{flavorName}</Link>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {review.score}/10 · {formatVisit(review.visitedOn)}
            </p>
          </>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <p className="text-2xl font-semibold">{review.score}/10</p>
            <p className="text-right text-sm text-muted-foreground">
              <Link href={authorId ? `/people/${authorId}` : "/people"} className="font-medium text-foreground">
                {authorName}
              </Link>
              <br />
              {formatVisit(review.visitedOn)}
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base leading-relaxed">{review.note}</p>
        {review.imagePath ? (
          <div className="relative aspect-4/3 overflow-hidden rounded-xl">
            <Image src={`/media/${review.imagePath}`} alt={imageAlt} fill unoptimized className="object-cover" />
          </div>
        ) : null}
        {canEdit ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => setEditing(true)}>
            Edit review
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
