"use client";

import { useActionState } from "react";
import { renameAccount, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(renameAccount, initial);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="account-name">Your name</Label>
        <Input id="account-name" name="name" required minLength={1} maxLength={40} defaultValue={name} />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save name"}
      </Button>
    </form>
  );
}
