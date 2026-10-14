"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "@/app/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: ActionState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" autoComplete="nickname" required maxLength={40} placeholder="Alex" />
      </div>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Saving…" : "That’s me"}
      </Button>
      <p className="text-sm leading-relaxed text-muted-foreground">
        No password. This phone keeps you signed in until you sign out.
      </p>
    </form>
  );
}
