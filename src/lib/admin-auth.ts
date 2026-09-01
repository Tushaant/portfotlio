export function dashboardToken() {
  const secret =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "tushant-local");
  if (!secret) return "";
  let h = 2166136261;
  for (let i = 0; i < secret.length; i += 1) {
    h ^= secret.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `t${(h >>> 0).toString(16)}${secret.length}`;
}

export function isValidPassword(password: string) {
  const secret =
    process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "tushant-local");
  return Boolean(secret) && password === secret;
}
