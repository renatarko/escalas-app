"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Calendar1,
  CalendarPlus,
  CalendarRange,
  LayoutDashboard,
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
  SidebarRail,
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
      <SidebarRail />
    </Sidebar>
  );
}
