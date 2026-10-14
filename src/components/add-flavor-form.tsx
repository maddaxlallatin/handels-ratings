"use client";

import { useActionState } from "react";
import { addFlavor, type ActionState } from "@/app/actions";
import { BASES } from "@/lib/bases";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ActionState = {};

export function AddFlavorForm() {
  const [state, action, pending] = useActionState(addFlavor, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add a flavor</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flavor-name">Name</Label>
            <Input id="flavor-name" name="name" required minLength={2} maxLength={80} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flavor-description">Description</Label>
            <Textarea id="flavor-description" name="description" required minLength={2} maxLength={280} rows={3} />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Base flavors</legend>
            <div className="grid grid-cols-2 gap-2">
              {BASES.map((base) => (
                <label key={base.id} className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm">
                  <input type="checkbox" name="bases" value={base.id} className="size-5 accent-primary" />
                  {base.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex min-h-11 items-center gap-3 text-base">
            <input type="checkbox" name="available" defaultChecked className="size-5 accent-primary" />
            Scooping at the shop right now
          </label>
          {state.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Adding…" : "Add flavor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
