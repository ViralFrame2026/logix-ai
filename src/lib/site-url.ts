type SiteUrlEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_URL?: string;
  VERCEL_URL?: string;
  VERCEL_ENV?: string;
  NODE_ENV?: string;
};

function normalizeOrigin(value: string | undefined, allowLocalhost: boolean) {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const validProtocol = url.protocol === "https:" || (allowLocalhost && isLocalhost && url.protocol === "http:");

    if (!validProtocol || (!allowLocalhost && isLocalhost) || url.username || url.password) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(env: SiteUrlEnvironment = process.env) {
  const isLocalDevelopment = env.NODE_ENV === "development" && !env.VERCEL_ENV;
  const candidates = env.VERCEL_ENV === "preview"
    ? [env.NEXT_PUBLIC_VERCEL_URL, env.VERCEL_URL, env.NEXT_PUBLIC_SITE_URL]
    : [env.NEXT_PUBLIC_SITE_URL, env.NEXT_PUBLIC_VERCEL_URL, env.VERCEL_URL];

  for (const candidate of candidates) {
    const origin = normalizeOrigin(candidate, isLocalDevelopment);
    if (origin) return origin;
  }

  return isLocalDevelopment ? "http://localhost:3000" : null;
}
