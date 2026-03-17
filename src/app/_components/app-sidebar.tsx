"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Calendar1,
  CalendarPlus,
  CalendarRange,
  ChevronUp,
  Edit,
  LayoutDashboard,
  LogOut,
  User2,
  UserPlus2,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { signOut } from "next-auth/react";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { title: "Minhas bandas", url: "/admin/manager", icon: LayoutDashboard },
  { title: "Escalas", url: "/admin/escalas", icon: CalendarRange },
  // { title: "Minhas Escalas", url: "/admin/minhas-escalas", icon: Calendar },
  {
    title: "Criar Escala",
    url: "/admin/criar-escala",
    icon: CalendarPlus,
    adminOnly: true,
  },
  {
    title: "Notificações",
    url: "/admin/notifications",
    icon: Bell,
    adminOnly: true,
  },
  {
    title: "Integrantes",
    url: "/admin/integrantes",
    icon: Users2,
    adminOnly: true,
  },
  {
    title: "Convites",
    url: "/admin/convites",
    icon: UserPlus2,
    adminOnly: true,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { membership, band, isLoading } = getCurrentMembership();
  const isUserAdmin = isAdmin(membership);

  const visibleMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isUserAdmin,
  );

  const isActive = (url: string) => {
    if (url === "/admin/escalas" && pathname === "/admin") return true;
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar className="border-sidebar-border border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="from-primary to-accent glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br shadow-lg">
            <Calendar1 className="text-primary-foreground h-5 w-5 shrink-0" />
          </div>
          <div>
            <h2 className="font-display text-sidebar-foreground text-2xl font-bold">
              Escalas App
            </h2>
            <p className="text-muted-foreground text-xs">
              Gestão de escalas e bandas
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    size="lg"
                    className="p-0"
                  >
                    <Link
                      href={item.url}
                      className={cn(
                        "focus:border-node group flex flex-1 items-center gap-3 p-2 focus:outline-none",
                        isActive(item.url) && "text-primary",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {isLoading ? (
        <div className="grid flex-1 space-y-2 text-left leading-tight">
          <Skeleton className="h-4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger className="hover:bg-muted-foreground/20 bg-muted flex w-full flex-col justify-start rounded-lg p-2 duration-150">
                  <p className="flex gap-2 text-sm font-semibold">
                    <User2 className="size-4" /> {membership?.user?.name}
                  </p>
                  <span className="text-muted-foreground truncate text-xs">
                    {membership?.user.email}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  sideOffset={10}
                  side="top"
                  className="min-w-48"
                >
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Conta
                  </DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Link
                      href={`/admin/user`}
                      className={"flex flex-1 items-center gap-2"}
                    >
                      <Edit className="size-4" />
                      <span>Meus Dados</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      signOut({ callbackUrl: "/", redirect: true })
                    }
                    variant="destructive"
                  >
                    <LogOut className="size-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
