"use client";

import { Check, Zap, Star, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-dashboard.png";
import Link from "next/link";
import { Button } from "../_components/ui/button";
import { Card, CardContent } from "../_components/ui/card";
import Image from "next/image";
import { SectionHeader } from "../_components/landing-page/section-header";
import { Badge } from "../_components/ui/badge";
import {
  benefits,
  features,
  howStartSteps,
  plans,
  testimonials,
} from "../_components/landing-page/features";
import { Footer } from "../_components/landing-page/footer";

const LandingPage = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20">
        <div className="from-primary/5 absolute inset-0 bg-linear-to-b via-transparent to-transparent" />
        <div className="bg-primary/10 absolute top-40 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-success/10 absolute top-60 right-1/4 h-72 w-72 rounded-full blur-3xl" />

        <div className="relative container mx-auto space-y-10 pt-8">
          <div className="mx-auto mb-16 max-w-4xl text-center">
            <Badge className="bg-primary/10 text-primary text-md mb-10 px-4 py-2">
              <Zap className="shrink-0" />
              Automatize suas escalas
            </Badge>

            <SectionHeader
              title="Gerencie escalas com"
              highlight="confirmação automática"
              description="Envie escalas via WhatsApp e receba confirmações automáticas.
              Nunca mais perca tempo cobrando respostas dos músicos."
            />

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="shadow-primary/30 group shadow-xl">
                  Começar Gratuitamente
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Ver Demonstração
              </Button>
            </div>
          </div>

          {/* <div className="relative mx-auto max-w-5xl">
            <div className="from-background pointer-events-none absolute inset-0 z-10 bg-linear-to-t via-transparent to-transparent" />
            <Image
              src={heroImage}
              alt="Escalas App Dashboard"
              className="shadow-primary/10 border-border/50 w-full rounded-2xl border shadow-2xl"
            />
          </div> */}
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-primary border-border/50 border-y py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {benefits.map((benefit, index) => (
              <div key={index + 1} className="flex items-center gap-3">
                <div className="bg-muted/10 flex h-10 w-10 items-center justify-center rounded-lg">
                  <benefit.icon className="size-5 text-white" />
                </div>
                <span className="text-md font-medium text-white">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24">
        <div className="container mx-auto">
          <SectionHeader
            title="Tudo que você precisa para"
            highlight="organizar sua banda"
            description="Funcionalidades pensadas especificamente para músicos e líderes de
              louvor"
          />

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index + 1}
                className="group border-border/50 bg-card/50 hover:shadow-primary/5 overflow-hidden p-0 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-0">
                  <div className="from-muted to-muted/50 aspect-square h-40 w-full overflow-hidden bg-linear-to-br md:h-60">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                      <feature.icon className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="container mx-auto">
          <SectionHeader
            title="Como funciona"
            description="Em 3 passos simples você automatiza suas escalas"
          />

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {howStartSteps.map((item, index) => (
              <div key={index + 1} className="relative text-center">
                <div className="from-primary to-primary/60 text-primary-foreground shadow-primary/25 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <div className="from-primary/50 absolute top-8 left-[65%] hidden h-[2px] w-[80%] bg-linear-to-r to-transparent md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24">
        <div className="container mx-auto">
          <SectionHeader
            title="Planos para cada"
            highlight="necessidade"
            description=" Comece grátis e evolua conforme sua banda cresce"
          />

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
            {plans.map((plan, index) => (
              <Card
                key={index + 1}
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "border-primary shadow-primary/10 scale-105 shadow-xl"
                    : "border-border/50 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="from-primary to-card-foreground text-primary-foreground absolute top-0 right-0 rounded-bl-lg bg-linear-to-r px-4 py-1 text-xs font-bold">
                    MAIS POPULAR
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index + 1} className="flex items-center gap-3">
                        <div className="bg-success/10 flex h-5 w-5 items-center justify-center rounded-full">
                          <Check className="text-success h-3 w-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.price === "Sob consulta"
                      ? "Falar com vendas"
                      : "Começar agora"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/30 px-6 py-24">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              O que nossos usuários dizem
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index + 1} className="border-border/50 bg-card/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i + 1}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="container mx-auto">
          <div className="from-primary/10 via-primary/5 border-primary/20 mx-auto max-w-4xl rounded-3xl border bg-linear-to-br to-transparent p-12 text-center">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Pronto para automatizar suas escalas?
            </h2>
            <p className="text-muted-foreground mb-8 text-xl">
              Comece gratuitamente e veja a diferença em minutos
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="shadow-primary/30 shadow-xl">
                Criar Conta Grátis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
