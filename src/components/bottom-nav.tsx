"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, IceCreamCone, Sparkles, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: House, match: (path: string) => path === "/" },
  { href: "/flavors", label: "Menu", icon: IceCreamCone, match: (path: string) => path.startsWith("/flavors") },
  { href: "/top", label: "Top", icon: Trophy, match: (path: string) => path.startsWith("/top") },
  { href: "/recommend", label: "For you", icon: Sparkles, match: (path: string) => path.startsWith("/recommend") },
  { href: "/people", label: "Crew", icon: Users, match: (path: string) => path.startsWith("/people") },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
