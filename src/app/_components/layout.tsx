"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { bandName, isLoading } = useFindCurrentBandId();
  return (
    <SidebarProvider>
      <div className="bg-background flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <header className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-4 border-b px-6 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            {isLoading ? (
              <p className="bg-muted-foreground/20 h-5 w-48 animate-pulse" />
            ) : (
              <p className="text-primary sm:text-md text-sm">
                Você está no Grupo <b>{bandName}</b>
              </p>
            )}
          </header>
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
