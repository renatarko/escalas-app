"use client";

import { redirect, useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import React, { useEffect } from "react";
import Link from "next/link";
import { Spinner } from "@/app/_components/ui/spinner";
import { Button } from "@/app/_components/ui/button";
import { MailOpen } from "lucide-react";

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

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = params.token as string;

  // Buscar informações do convite
  const {
    data: invite,
    isLoading,
    error,
  } = api.invitation.getByToken.useQuery({ token }, { enabled: !!token });

  // Mutation para aceitar convite
  const {
    mutate: acceptInvite,
    isPending: acceptInviteIsLoading,
    error: acceptInviteError,
  } = api.invitation.accept.useMutation({
    onSuccess: (data) => {
      router.push(`/${data.band.nickname}`);
    },
    onError: (error) => {
      console.error("Erro ao aceitar convite:", error);
    },
  });

  // Se o usuário estiver autenticado e o convite for válido, aceitar automaticamente
  useEffect(() => {
    if (session?.user && invite && !acceptInviteIsLoading) {
      if (session.user.email === invite.email) {
        acceptInvite({ token });
      }
    }
  }, [session, invite, token]);

  function signInFromInvite() {
    // "use server";

    // (await cookies()).set("invite-token", token);
    // (await cookies()).set("invite-email", invite.email ?? "");
    const encodedEmail = encodeURIComponent(invite?.email ?? "");
    redirect(`/auth/sign-in?invite=${encodedEmail}`);
  }

  if (isLoading || status === "loading") {
    return <LoadingCard label="Carregando convite..." />;
  }

  if (error || !invite) {
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
            {error?.message ?? "Este convite não existe ou já expirou."}
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

  if (acceptInviteIsLoading) {
    return <LoadingCard label="Aceitando convite..." />;
  }

  if (acceptInviteError) {
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Erro</h1>
          <p className="text-muted mb-6">{acceptInviteError.message}</p>
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

  // Se não estiver autenticado, mostrar opções
  if (!session) {
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
            Entrar para Aceitar
            {/* <Link href={`/auth/sign-in?invite=${token}`}>
            </Link> */}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Ainda não tem conta?{" "}
            <Link
              href={`/auth/sign-up?invite=${token}`}
              className="text-blue-600 hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </CustomCard>
    );
  }

  // Se o email não corresponder
  if (session.user.email !== invite.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
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
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Email Incorreto
          </h1>
          <p className="mb-2 text-gray-600">
            Este convite foi enviado para <strong>{invite.email}</strong>
          </p>
          <p className="mb-6 text-gray-600">
            Você está conectado como <strong>{session.user.email}</strong>
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                // Fazer logout e redirecionar
                window.location.href = `/api/auth/signout?callbackUrl=/invite/${token}`;
              }}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
            >
              Trocar de Conta
            </button>
            <Link
              href="/"
              className="block w-full rounded-2xl bg-gray-200 px-6 py-2 text-center text-gray-700"
            />
          </div>
        </div>
      </div>
    );
  }
}
