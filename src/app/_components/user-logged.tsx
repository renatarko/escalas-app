import { Calendar, LogOut, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const UserLogged = () => {
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);

  const userLogged = () => {
    const name = session?.user?.name;
    const email = session?.user.email;
    if (!name) {
      const emailName = email?.split("@")[0];
      return emailName?.slice(0, 2).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="bg-muted border-input h-10 w-10 rounded-full border p-2 uppercase">
        {userLogged() ?? <User />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/admin">
            <Calendar className="mr-1 h-4 w-4" />
            Minhas Escalas
          </Link>
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
