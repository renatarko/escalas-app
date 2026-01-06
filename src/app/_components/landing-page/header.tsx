"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { getCurrentMembership } from "@/lib/hooks/members";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import logo from "@/assets/calendar-icon.png";

export const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname();

  const user = session?.user;
  const { band } = getCurrentMembership();

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
    <nav className="bg-background/80 border-border/50 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-xl sm:h-10 sm:w-10">
            <Image
              src={logo}
              alt="Logo da Escalas App"
              width={24}
              height={24}
            />
          </div>
          <span className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text font-bold text-transparent sm:text-xl">
            Escalas App
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Funcionalidades
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Preços
          </a>
          <a
            href="#testimonials"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Depoimentos
          </a>
        </div>
        <div className="flex items-center gap-3">
          {!user ? (
            <Button variant="outline">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
          ) : (
            <Button onClick={redirectManagerRoute}>Minhas Escalas</Button>
          )}

          {!user && (
            <Link href="/auth/sign-up" className="hidden sm:flex">
              <Button className="shadow-primary/25 shadow-lg">
                Começar Grátis
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
