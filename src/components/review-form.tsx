"use client";

import { useActionState, useMemo } from "react";
import Image from "next/image";
import { addReview, updateReview, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ActionState = {};

export type ReviewDraft = {
  id: number;
  score: number;
  note: string;
  visitedOn: string;
  imagePath: string | null;
};

export function ReviewForm({
  flavorId,
  review,
  returnTo = "flavor",
  onCancel,
}: {
  flavorId: number;
  review?: ReviewDraft;
  returnTo?: "flavor" | "profile";
  onCancel?: () => void;
}) {
  const editing = Boolean(review);
  const [state, action, pending] = useActionState(editing ? updateReview : addReview, initial);
  const today = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);
  const fieldId = review ? `review-${review.id}` : `flavor-${flavorId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{editing ? "Edit this scoop" : "Log this scoop"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="flavorId" value={flavorId} />
          {review ? <input type="hidden" name="reviewId" value={review.id} /> : null}
          {review ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Score</legend>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
                <label key={score} className="relative">
                  <input
                    type="radio"
                    name="score"
                    value={score}
                    required
                    defaultChecked={score === (review?.score ?? 8)}
                    className="peer sr-only"
                  />
                  <span className="flex h-12 items-center justify-center rounded-lg border bg-card text-base font-semibold peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                    {score}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-note`}>What did you think?</Label>
            <Textarea
              id={`${fieldId}-note`}
              name="note"
              required
              minLength={2}
              maxLength={1000}
              rows={4}
              defaultValue={review?.note}
              placeholder="Required. Texture, mix-ins, would you get it again?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-date`}>Day you ate it</Label>
            <Input
              id={`${fieldId}-date`}
              type="date"
              name="visitedOn"
              required
              defaultValue={review?.visitedOn ?? today}
            />
          </div>
          {review?.imagePath ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current photo</p>
              <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                <Image
                  src={`/media/${review.imagePath}`}
                  alt="Current review photo"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <label className="flex min-h-11 items-center gap-3 text-base">
                <input type="checkbox" name="removeImage" className="size-5 accent-primary" />
                Remove photo
              </label>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor={`${fieldId}-image`}>{review?.imagePath ? "Replace photo" : "Photo, optional"}</Label>
            <Input id={`${fieldId}-image`} type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
          </div>
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Save review"}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
