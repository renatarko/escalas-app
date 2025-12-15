"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentMembership } from "@/lib/hooks/members";

export const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user;
  const { band } = getCurrentMembership();

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

  const redirectManagerRoute = () => {
    if (band) {
      router.push("/admin/manager");
      return;
    }
    router.push("/onboarding");
  };

  return (
    <header
      className={`border-muted bg-muted fixed right-0 left-0 z-50 container mx-auto flex items-center justify-between rounded-lg border-b p-4 shadow-md sm:top-6 ${isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-100 sm:opacity-0"} duration-150`}
    >
      <Link href="/">
        <CalendarCheck className="size-6" />
      </Link>
      <div className="flex items-center gap-4 justify-self-end">
        {!!user && (
          <Button onClick={redirectManagerRoute}>Minhas Escalas</Button>
        )}

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
