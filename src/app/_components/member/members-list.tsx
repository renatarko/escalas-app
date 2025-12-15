"use client";

import { useFindManyMembers } from "@/lib/hooks/members";
import { MemberCard } from "./member-card";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { MembersDialogSelect } from "./member-select";

export const MembersList = () => {
  const [search, setSearch] = useState("");
  const { members, isLoading } = useFindManyMembers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i + 1}
            className="bg-muted h-20 w-full animate-pulse rounded-lg border p-8"
          ></div>
        ))}
      </div>
    );
  }

  if (!members) {
    return (
      <div className="flex w-full items-center justify-center">
        <p>Não encontramos nenhum participante</p>
      </div>
    );
  }

  const filteredMembers = (members || []).filter(
    (member) =>
      member?.name?.toLowerCase().includes(search.toLowerCase()) ??
      member.instruments[0]?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar integrantes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} {...member} />
        ))}
      </div>

      <MembersDialogSelect className="w-full" />

      {filteredMembers.length === 0 && (
        <div className="bg-card border-border rounded-xl border py-12 text-center">
          <Search className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="text-foreground mb-1 font-medium">
            Nenhum integrante encontrado
          </h3>
          <p className="text-muted-foreground text-sm">
            {search
              ? "Tente uma busca diferente"
              : "Adicione um novo integrante para começar"}
          </p>
        </div>
      )}
    </div>
  );
};
