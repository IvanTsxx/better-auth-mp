import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  rewrites() {
    return [
      {
        destination: "/:lang/llms.mdx/:path*",
        source: "/:lang/:path*.mdx",
      },
    ];
  },
  serverExternalPackages: ["@takumi-rs/image-response"],
};

export default withMDX(config);
