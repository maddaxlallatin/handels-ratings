"use client";

import { useActionState, useMemo } from "react";
import { addReview, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ActionState = {};

export function ReviewForm({ flavorId }: { flavorId: number }) {
  const [state, action, pending] = useActionState(addReview, initial);
  const today = useMemo(() => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Log this scoop</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="flavorId" value={flavorId} />
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
                    defaultChecked={score === 8}
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
            <Label htmlFor="note">What did you think?</Label>
            <Textarea
              id="note"
              name="note"
              required
              minLength={2}
              maxLength={1000}
              rows={4}
              placeholder="Required. Texture, mix-ins, would you get it again?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitedOn">Day you ate it</Label>
            <Input id="visitedOn" type="date" name="visitedOn" required defaultValue={today} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Photo, optional</Label>
            <Input id="image" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
          </div>
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Saving…" : "Save review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
