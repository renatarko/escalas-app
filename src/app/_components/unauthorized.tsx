"use client";

import { KeyRound } from "lucide-react";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type UnauthorizedProps = {
  description?: string;
};

export const Unauthorized = ({ description }: UnauthorizedProps) => {
  const router = useRouter();

  const handleBackButton = () => {
    if (document.referrer === window.location.href) {
      router.push("/");
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-card flex w-full flex-col items-center justify-center gap-6 rounded-lg border p-4 sm:w-[480px]">
      <div className="flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="border-primary-foreground/10 bg-input flex h-10 w-10 flex-col items-center justify-center gap-4 rounded-full border">
          <KeyRound className="text-primary" size={20} />
        </div>
        <h3 className="text-lg font-bold">Acesso Negado</h3>

        {!description ? (
          <>
            <p>Você não tem permissão para acessar esta página.</p>
            <p className="text-muted-foreground text-xs">
              Por favor, entre em contato com o administrador se achar que isso
              é um erro.
            </p>
          </>
        ) : (
          <p>{description}</p>
        )}
      </div>
      <div className="flex items-center justify-end gap-4">
        <Button onClick={handleBackButton} variant="outline">
          Voltar
        </Button>
        <Button onClick={() => router.push("/")}>Página Inicial</Button>
      </div>
    </div>
  );
};
