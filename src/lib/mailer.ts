import { Resend } from "resend";
import { type EmailConfig } from "next-auth/providers/email";
import type { ReactElement, ReactNode } from "react";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async (
  email: string | string[],
  subject: string,
  emailHtml: string,
  provider?: EmailConfig,
) => {
  try {
    const fromEmail =
      env.NODE_ENV === "production"
        ? (provider?.from ?? "welcome@rerko.net")
        : env.SMTP_FROM;

    const response = await resend.emails.send({
      from: fromEmail ?? "no-reply@resend.dev",
      to: email,
      subject,
      html: emailHtml,
    });

    return response;
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export const getData = async (component: ReactElement | ReactNode) => {
  const ReactDOMServer = (await import("react-dom/server")).default;
  return ReactDOMServer.renderToStaticMarkup(component);
};
