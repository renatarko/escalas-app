import {
  Calendar,
  CalendarPlus,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  User,
  UserPlus,
  Users2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";

export const UserLogged = () => {
  const { data: session } = useSession();
  const { membership, band } = getCurrentMembership();

  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const userLogged = useMemo(() => {
    const name = session?.user?.name;
    const email = session?.user.email;
    if (!name) {
      const emailName = email?.split("@")[0];
      return emailName?.slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [session]);

  const redirectManagerRoute = () => {
    if (band) {
      router.push("/admin/manager");
      return;
    }
    router.push("/onboarding");
  };

  const isCurrentPath = (target: string) => {
    if (pathname === target) return true;
    return pathname.startsWith(`${target}/`);
  };

  const isUserAdmin = isAdmin(membership);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="bg-muted border-input h-10 w-10 rounded-full border p-2 uppercase">
        {userLogged ?? <User />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={redirectManagerRoute}
          className={`${pathname === "/admin/manager" && "bg-primary/5 text-primary"}`}
        >
          <LayoutDashboard className="mr-1 h-4 w-4" />
          Minhas bandas/grupos
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={cn(isCurrentPath("/admin/escalas") && "bg-primary/5 text-primary")}
          onClick={() => router.push("/admin/escalas")}
        >
          <CalendarDays className="mr-1 h-4 w-4" />
          Todas as Escalas
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(
            isCurrentPath("/admin/minhas-escalas") &&
              "bg-primary/5 text-primary",
          )}
          onClick={() => router.push("/admin/minhas-escalas")}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Minhas Escalas
        </DropdownMenuItem>

        {isUserAdmin && (
          <DropdownMenuItem
            className={cn(
              isCurrentPath("/admin/criar-escala") &&
                "bg-primary/5 text-primary",
            )}
            onClick={() => router.push("/admin/criar-escala")}
          >
            <CalendarPlus className="mr-1 h-4 w-4" />
            Criar Escala
          </DropdownMenuItem>
        )}

        {isUserAdmin && (
          <DropdownMenuItem
            className={cn(
              isCurrentPath("/admin/integrantes") &&
                "bg-primary/5 text-primary",
            )}
            onClick={() => router.push("/admin/integrantes")}
          >
            <Users2 className="mr-1 h-4 w-4" />
            Integrantes
          </DropdownMenuItem>
        )}

        {isUserAdmin && (
          <DropdownMenuItem
            className={cn(
              isCurrentPath("/admin/convites") &&
                "bg-primary/5 text-primary",
            )}
            onClick={() => router.push("/admin/convites")}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Convidar Integrantes
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
