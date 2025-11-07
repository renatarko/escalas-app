"use client";

import { useFindCurrentBandId } from "@/lib/hooks/band";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { bandName, isLoading } = useFindCurrentBandId();
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center px-2 pt-24 pb-12 sm:pt-30">
      {isLoading ? (
        <p className="bg-muted-foreground/20 mb-3 h-5 w-48 animate-pulse" />
      ) : (
        <p className="text-primary sm:text-md mb-3 text-sm">
          Você está no Grupo <b>{bandName}</b>
        </p>
      )}

      {children}
    </main>
  );
}
