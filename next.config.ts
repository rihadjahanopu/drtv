import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
	dest: "public",
	cacheOnFrontEndNav: true,
	aggressiveFrontEndNavCaching: true,
	reloadOnOnline: true,
	disable: false, // temporarily false to test in dev
	workboxOptions: {
		disableDevLogs: true,
	},
});

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
	reactCompiler: true,
	turbopack: {},
};

export default withPWA(nextConfig);
