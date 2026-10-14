import Link from "next/link";
import { IceCreamCone } from "lucide-react";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function Header({ user }: { user: { id: number; name: string } | null }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <IceCreamCone className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">Handels</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-1">
            <Button variant="ghost" className="max-w-36 px-2" asChild>
              <Link href={`/people/${user.id}`} className="truncate">
                {user.name}
              </Link>
            </Button>
            <form action={signOut}>
              <Button type="submit" variant="outline" className="px-3">
                Out
              </Button>
            </form>
          </div>
        ) : (
          <Button variant="outline" className="px-3" asChild>
            <Link href="/">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
