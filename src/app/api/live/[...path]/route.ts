import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> }
) {
	const { path } = await params;
	const pathStr = path.join("/");
	
	// Reconstruct the destination URL
	const searchParams = request.nextUrl.search;
	const targetUrl = `http://198.195.239.50:8095/${pathStr}${searchParams}`;

	try {
		const response = await fetch(targetUrl, {
			headers: {
				"User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			return new NextResponse(`Failed to fetch from stream source: ${response.statusText}`, {
				status: response.status,
			});
		}

		// Stream the response back to the client
		return new NextResponse(response.body, {
			headers: {
				"Content-Type": response.headers.get("content-type") || "application/vnd.apple.mpegurl",
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
		});
	} catch (error: any) {
		console.error("Stream proxy error:", error);
		return new NextResponse(`Proxy error: ${error.message}`, { status: 500 });
	}
}
