export const getCurrentBandFromCookie = () => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const nicknameCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("nicknameBand="),
  );
  return nicknameCookie
    ? decodeURIComponent(nicknameCookie.split("=")[1] ?? "")
    : null;
};

export const setBandInCookie = (nickname: string) => {
  if (typeof document === "undefined") return;

  document.cookie = `nicknameBand=${nickname}; path=/`;
};

export const clearEventFromCookie = () => {
  if (typeof document === "undefined") return;

  document.cookie = "eventSlug=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};
