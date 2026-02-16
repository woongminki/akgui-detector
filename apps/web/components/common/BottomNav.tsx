"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PenSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "home", label: "홈", icon: Home, href: "/" },
  { id: "group", label: "그룹", icon: Users, href: "/group" },
  { id: "write", label: "글쓰기", icon: PenSquare, href: "/write" },
  { id: "my", label: "마이", icon: User, href: "/my" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const getIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item.href);
          const isWrite = item.id === "write";

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                isWrite && "relative"
              )}
            >
              {isWrite ? (
                <div className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                  <Icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
