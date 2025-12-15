"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { UserLogged } from "./user-logged";

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { bandName, isLoading } = useFindCurrentBandId();
  return (
    <SidebarProvider>
      <div className="bg-background flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <header className="border-border bg-background/80 sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-6 backdrop-blur-sm sm:h-14">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              {isLoading ? (
                <p className="bg-muted-foreground/10 h-5 w-48 animate-pulse rounded-lg" />
              ) : (
                <p className="text-primary sm:text-md text-sm">
                  Você está no Grupo <b>{bandName}</b>
                </p>
              )}
            </div>

            <UserLogged />
          </header>
          <div className="mb-6 flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
