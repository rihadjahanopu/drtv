import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "s3.aynaott.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/api/live/:path*",
				destination: "http://198.195.239.50:8095/:path*", // আপনার আইপি সার্ভার
			},
		];
	},
	reactCompiler: true,
};

export default nextConfig;
