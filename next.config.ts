import type { NextConfig } from "next";
const config: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "./.env*",
      "./.git/**",
      "./.remote-review/**",
      "./data/**",
      "./test-results/**",
      "./artifacts/**",
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
