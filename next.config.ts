import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

function resolveDevDistDir() {
  const portFlagIndex = process.argv.findIndex(
    (value) => value === "--port" || value === "-p"
  );
  const port =
    process.env.PORT ??
    (portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : undefined);

  return port ? `.next-dev-${port}` : ".next-dev";
}

const nextConfig = (phase: string): NextConfig => ({
  // Isolate dev artifacts so parallel Next.js servers do not race on `.next`.
  ...(phase === PHASE_DEVELOPMENT_SERVER
    ? { distDir: resolveDevDistDir() }
    : {}),
  typedRoutes: true,
  images: {
    formats: ["image/avif", "image/webp"]
  }
});

export default nextConfig;
