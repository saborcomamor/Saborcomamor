import type { NextConfig } from "next";
const supabaseHost = (() => {
  try { return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null; }
  catch { return null; }
})();
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : "";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
  ] },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
      ...(process.env.NODE_ENV === "production" ? [{ key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https://images.unsplash.com ${supabaseOrigin}; font-src 'self' data:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ${supabaseOrigin} ${supabaseHost ? `wss://${supabaseHost}` : ''}; upgrade-insecure-requests` }] : [])
    ];
    return [{ source: "/:path*", headers: security }];
  }
};
export default nextConfig;
