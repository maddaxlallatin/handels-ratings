"use client";

import { useActionState } from "react";
import { savePreferences, type ActionState } from "@/app/actions";
import { BASES } from "@/lib/bases";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initial: ActionState = {};

export function PreferenceForm({
  userId,
  likes,
  dislikes,
}: {
  userId: number;
  likes: string[];
  dislikes: string[];
}) {
  const [state, action, pending] = useActionState(savePreferences, initial);
  const liked = new Set(likes);
  const disliked = new Set(dislikes);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      {BASES.map((base) => {
        const current = liked.has(base.id) ? "like" : disliked.has(base.id) ? "dislike" : "";
        return (
          <fieldset key={base.id} className="space-y-2 rounded-xl border p-3">
            <legend className="px-1 text-sm font-medium">{base.label}</legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["like", "Like"],
                  ["dislike", "Dislike"],
                  ["", "Neither"],
                ] as const
              ).map(([value, label]) => (
                <label key={label} className="relative">
                  <input
                    type="radio"
                    name={`base:${base.id}`}
                    value={value}
                    defaultChecked={current === value}
                    className="peer sr-only"
                  />
                  <span className="flex h-11 items-center justify-center rounded-lg border text-sm font-medium peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
