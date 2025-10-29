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
