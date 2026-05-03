/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // DuckDB-WASM ships its own worker bundles; let webpack hand them through.
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wasm)$/,
      type: "asset/resource",
    });
    return config;
  },
  async headers() {
    return [
      {
        // Required for SharedArrayBuffer + DuckDB-WASM threading
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
