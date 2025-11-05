import { api } from "@/trpc/server";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, LogOut, MailOpen } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Separator } from "../../_components/ui/separator";
import { Button } from "../../_components/ui/button";
import { auth } from "@/server/auth";
import { Spinner } from "@/app/_components/ui/spinner";

const CustomCard = ({
  title,
  subtitle,
  expiresAt,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  expiresAt?: Date;
  children: React.ReactNode;
}) => {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-card flex w-full max-w-md flex-col justify-center gap-6 rounded-lg p-8 text-center shadow-lg">
        <div className="flex flex-col items-center justify-center gap-2">
          <MailOpen className="h-8 w-8" />
          <h1 className="mb-2 text-2xl font-bold">{title}</h1>
          {subtitle}
        </div>

        {children}

        {expiresAt && (
          <div className="border-muted">
            <p className="text-muted-foreground text-center text-xs">
              Este convite expira em{" "}
              {new Date(expiresAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingCard = ({ label }: { label: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

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
    redirect(`/auth/sign-up?invite=${encodedEmail}`);
  }

  async function acceptInviteAction() {
    "use server";

    await api.invitation.accept({ token });

    // redirect(`/manada/${invite?.organization.slug}`);
  }

  if (!invite) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="bg-card w-full max-w-md rounded-lg p-8 text-center shadow-lg">
          <div className="mb-4">
            <svg
              className="text-destructive mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Convite Inválido</h1>
          <p className="text-muted mb-6">
            {"Este convite não existe ou já expirou."}
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isUserAuthenticated) {
    return (
      <CustomCard
        title="Você foi convidado!"
        subtitle={
          <>
            <p className="text-muted-foreground">
              <strong>{invite.invitedBy.name}</strong> convidou você para
              participar da banda
            </p>
            <p className="mt-2 text-xl font-semibold text-blue-600 underline">
              {invite.band.name}
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center gap-6">
          <Button onClick={signInFromInvite} className="w-full">
            Aceitar Convite
          </Button>
        </div>
      </CustomCard>
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
