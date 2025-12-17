import type { NextConfig } from "next";

const replitDomains = process.env.REPLIT_DOMAINS?.split(",") || [];

const nextConfig: NextConfig = {
  allowedDevOrigins: replitDomains,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
  },
};

export default nextConfig;
