import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "./_components/ui/sonner";
import { Header } from "./_components/landing-page/header";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/server/auth";
import { AbilityProvider } from "@/lib/utils/abilityContext";
import { getCurrentMembership } from "@/lib/auth/ability";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const metadataObject = {
  url: "https://escalasapp.vercel.app",
  title: "Organize suas escalas com facilidade",
  description:
    "Crie escalas automáticas e gerencie bandas, equipes e ministérios de forma simples e intuitiva.",
  imageUrl: "/opengraph-image",
};

export const metadata: Metadata = {
  title: "Escalas App",
  description:
    "Gerencie escalas de músicos e equipes com automação inteligente. Crie escalas para cultos e eventos, organize bandas, cadastre integrantes e acompanhe tudo em uma plataforma simples, rápida e moderna.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  keywords: [
    "escalas automáticas",
    "sistema de escalas",
    "gerenciamento de bandas",
    "ministério de louvor",
    "equipes da igreja",
    "escalas para igreja",
    "plataforma para cultos",
    "organização de voluntários",
    "criar escalas",
    "sistema para igrejas",
    "escalas de músicos",
    "gerenciamento de equipes",
    "gestão de ministérios",
  ],
  openGraph: {
    title: metadataObject.title,
    description: metadataObject.description,
    url: metadataObject.url,
    type: "website",
    images: [
      {
        url: metadataObject.imageUrl,
        width: 1200,
        height: 630,
        alt: metadataObject.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: metadataObject.title,
    description: metadataObject.description,
    images: [
      {
        url: metadataObject.imageUrl,
        width: 1200,
        height: 630,
        alt: "Organize suas escalas com facilidade",
      },
    ],
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["300", "400", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  let membership = null;

  if (session?.user) {
    membership = await getCurrentMembership();
  }

  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="scroll-smooth bg-linear-to-b from-slate-50 to-white">
        <TRPCReactProvider>
          <AbilityProvider
            user={{
              id: membership?.userId ?? "",
              role: membership?.role ?? "MEMBER",
            }}
          >
            <SessionProvider session={session}>
              {/* <Header /> */}
              <Header />
              {children}
            </SessionProvider>
            <Toaster />
          </AbilityProvider>
        </TRPCReactProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
