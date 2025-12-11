"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserLogged } from "./user-logged";

export const Header = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.includes("auth") || pathname.includes("admin")) {
    return null;
  }

  return (
    <header
      className={`border-muted bg-muted fixed right-0 left-0 z-50 container mx-auto flex items-center justify-between rounded-lg border-b p-4 shadow-md sm:top-6 ${isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-100 sm:opacity-0"} duration-150`}
    >
      <Link href="/">
        <CalendarCheck className="size-6" />
      </Link>
      <div className="flex items-center gap-4 justify-self-end">
        {!!user && user.role === "ADMIN" && <UserLogged />}

        {!!user && user.role === "USER" && <UserLogged />}

        {!user && (
          <Button variant="outline">
            <Link href="/auth/sign-in">Login</Link>
          </Button>
        )}

        {!user && (
          <Button>
            <Link href="/auth/sign-up">Criar Conta</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
