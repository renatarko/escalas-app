"use client";

import { Calendar } from "lucide-react";

export const Footer = () => {
  const date = new Date().getFullYear();
  return (
    <footer className="border-border/50 border-t px-6 py-12">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="from-primary to-primary/60 flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br">
              <Calendar className="text-primary-foreground h-4 w-4" />
            </div>
            <span className="font-bold">Escalas App</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {date} Escalas App. Todos os direitos reservados.
          </p>
          {/* <div className=" items-center gap-6 hidden">
      <a
        href="#"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Termos
      </a>
      <a
        href="#"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Privacidade
      </a>
      <a
        href="#"
        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
      >
        Contato
      </a>
    </div> */}
        </div>
      </div>
    </footer>
  );
};
