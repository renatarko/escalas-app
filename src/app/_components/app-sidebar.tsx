"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CalendarPlus,
  CalendarRange,
  LayoutDashboard,
  Music2,
  UserPlus2,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { title: "Minhas bandas", url: "/admin/manager", icon: LayoutDashboard },
  { title: "Escalas", url: "/admin/escalas", icon: CalendarRange },
  { title: "Minhas Escalas", url: "/admin/minhas-escalas", icon: Calendar },
  {
    title: "Criar Escala",
    url: "/admin/criar-escala",
    icon: CalendarPlus,
    adminOnly: true,
  },
  {
    title: "Integrantes",
    url: "/admin/integrantes",
    icon: Users2,
    adminOnly: true,
  },
  { title: "Convites", url: "/admin/convites", icon: UserPlus2, adminOnly: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { membership } = getCurrentMembership();
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
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="from-primary to-accent glow-primary flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
            <Music2 className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-sidebar-foreground text-lg font-bold">
              Escalas
            </h1>
            <p className="text-muted-foreground text-xs">Gestão de Bandas</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                        isActive(item.url) &&
                          "bg-sidebar-accent text-sidebar-foreground",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
