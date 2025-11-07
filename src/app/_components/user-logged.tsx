import {
  Calendar,
  CalendarPlus,
  LayoutDashboard,
  LogOut,
  User,
  UserPlus,
  Users2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTabsStore, type TabsStoreProps } from "@/stores/use-tabs-store";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const UserLogged = () => {
  const { data: session } = useSession();
  const { tab, setTab } = useTabsStore();

  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const handleTabChange = (value: TabsStoreProps) => {
    setTab(value);

    if (pathname === "/admin") return;
    router.push("/admin");
  };

  const userLogged = () => {
    const name = session?.user?.name;
    const email = session?.user.email;
    if (!name) {
      const emailName = email?.split("@")[0];
      return emailName?.slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const setActiveColorIfTabIsActive = (currentTab: TabsStoreProps) => {
    if (pathname !== "/admin") return;
    if (currentTab === tab) return "bg-primary/5 text-primary";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="bg-muted border-input h-10 w-10 rounded-full border p-2 uppercase">
        {userLogged() ?? <User />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/admin/manager")}
          className={`${pathname === "/admin/manager" && "bg-primary/5 text-primary"}`}
        >
          <LayoutDashboard className="mr-1 h-4 w-4" />
          Todas bandas
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={cn(setActiveColorIfTabIsActive("scales"))}
          onClick={() => handleTabChange("scales")}
        >
          <Calendar className="mr-1 h-4 w-4" />
          Minhas Escalas
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(setActiveColorIfTabIsActive("create-scales"))}
          onClick={() => handleTabChange("create-scales")}
        >
          <CalendarPlus className="mr-1 h-4 w-4" />
          Criar Escala
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(setActiveColorIfTabIsActive("participants"))}
          onClick={() => handleTabChange("participants")}
        >
          <Users2 className="mr-1 h-4 w-4" />
          Participantes
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(setActiveColorIfTabIsActive("invitations"))}
          onClick={() => handleTabChange("invitations")}
        >
          <UserPlus className="mr-1 h-4 w-4" />
          Convidar
        </DropdownMenuItem>

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
