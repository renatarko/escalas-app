"use client";

import { LogOut, User, Music2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getCurrentMembership } from "@/lib/hooks/members";
import { isAdmin } from "@/lib/utils/role-checker";
import { api } from "@/trpc/react";
import {
  getCurrentBandFromCookie,
  setBandInCookie,
} from "@/lib/utils/getCurrentBandFromCookie";
import { CreateBandDialog } from "./create-band-dialog";

export const UserLogged = () => {
  const { data: session } = useSession();
  const { membership } = getCurrentMembership();
  const { data: bands, isPending: bandIsPending } =
    api.band.getBands.useQuery();

  const currentBand = getCurrentBandFromCookie();

  const userLogged = useMemo(() => {
    const name = session?.user?.name;
    const email = session?.user.email;
    if (!name) {
      const emailName = email?.split("@")[0];
      return emailName?.slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [session]);

  const handleBandChange = (nickname: string) => {
    setBandInCookie(nickname);
    window.location.reload();
  };

  const isUserAdmin = isAdmin(membership);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-muted border-input h-10 w-10 rounded-full border p-2 uppercase">
        {userLogged ?? <User />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>
          {isUserAdmin ? "Bandas/Grupos" : "Área do membro"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isUserAdmin && (
          <DropdownMenuGroup>
            {bandIsPending &&
              Array.from({ length: 2 }).map((item, i) => (
                <DropdownMenuItem
                  key={i + 1}
                  disabled
                  className={"bg-muted h-12 w-full animate-pulse"}
                >
                  <Music2 className="opacity-50" />
                </DropdownMenuItem>
              ))}

            {bands?.map((band) => (
              <DropdownMenuItem
                key={band.id}
                onClick={() => handleBandChange(band.nickname)}
                className={`font-medium ${currentBand === band.nickname ? "bg-primary/5 text-primary" : ""}`}
              >
                <Music2 />
                {band.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        <CreateBandDialog variant="ghost" label="Nova banda" />

        {isUserAdmin && <DropdownMenuSeparator />}
        <DropdownMenuItem
          className="cursor-pointer"
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/", redirect: true })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
