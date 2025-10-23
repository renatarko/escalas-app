"use server";

import { cookies } from "next/headers";

export async function getEmailFromCookie() {
  const email = (await cookies()).get("invite-email")?.value;
  const encodedEmail = encodeURIComponent(email ?? "");
  return encodedEmail;
}
