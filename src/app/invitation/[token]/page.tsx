import { api } from "@/trpc/server";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, LogIn, LogOut } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Separator } from "../../_components/ui/separator";
import { Button } from "../../_components/ui/button";
import { auth } from "@/server/auth";

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = params;

  const invite = await api.invitation.getByToken({ token });
  const isUserAuthenticated = await auth();

  let currentUserEmail = null;

  if (isUserAuthenticated) {
    const { user } = isUserAuthenticated;
    currentUserEmail = user.email;
  }

  const userIsAuthenticatedWithSameEmailFromInvite =
    currentUserEmail === invite?.email;

  async function signInFromInvite() {
    "use server";

    (await cookies()).set("invite-token", token);
    (await cookies()).set("invite-email", invite.email);
    const encodedEmail = encodeURIComponent(invite?.email ?? "");
    redirect(`/auth/sign-in?email=${encodedEmail}`);
  }

  async function acceptInviteAction() {
    "use server";

    await api.invitation.accept({ token });

    // redirect(`/manada/${invite?.organization.slug}`);
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col justify-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed text-balance">
              Ops! Não encontramos nenhum convite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-chart-3 flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="space-y-2 text-center text-white">
        <p className="font-semibold">Seja bem vindo!</p>
        <p className="text-2xl">Você está no Escalas App</p>
      </div>
      <div className="bg-card flex w-full max-w-md flex-col justify-center space-y-6 rounded-lg p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="font-bold">Você Recebeu um Convite 🎉</h2>
          <p className="text-muted-foreground text-center leading-relaxed text-balance">
            Você foi convidado para se juntar a banda{" "}
            <span className="text-chart-3 font-bold underline">
              {invite?.band.name}
            </span>
            .{" "}
            <span className="text-xs">
              {formatDistanceToNow(new Date(invite?.createdAt ?? new Date()), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </p>
        </div>

        <Separator />

        {!isUserAuthenticated && (
          <form action={signInFromInvite}>
            <Button type="submit" className="w-full" size="lg">
              <LogIn className="mr-2 size-4" />
              Aceitar o convite
            </Button>
          </form>
        )}

        {userIsAuthenticatedWithSameEmailFromInvite && (
          <form action={acceptInviteAction}>
            <Button type="submit" variant="secondary" className="w-full">
              <CheckCircle className="mr-2 size-4" />
              Fazer parte de {invite?.band.name}
            </Button>
          </form>
        )}

        {isUserAuthenticated && !userIsAuthenticatedWithSameEmailFromInvite && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center text-sm leading-relaxed text-balance">
              Este convite foi enviado a{" "}
              <span className="text-foreground font-medium">
                {invite?.email}
              </span>{" "}
              mas você está autenticado(a) como{" "}
              <span className="text-foreground font-medium">
                {currentUserEmail}
              </span>
              .
            </p>

            <div className="space-y-2">
              <Button className="w-full" variant="secondary" asChild>
                <Link href="/api/auth/signout">
                  <LogOut className="mr-2 size-4" />
                  Sair de {currentUserEmail}
                </Link>
              </Button>

              <Button className="w-full" variant="outline" asChild>
                <Link href="/">Voltar para a página inicial</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
