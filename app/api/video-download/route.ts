// app/api/download/route.ts
import { NextResponse } from 'next/server';

// Set your express server URL here - this will be your Render deployment URL
const EXPRESS_API_URL =
	process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:8080';

interface DownloadRequest {
	url: string;
	formatId: string;
	isAudioOnly: boolean;
}

export async function POST(request: Request) {
	try {
		const body: DownloadRequest = await request.json();

		// Forward the request to Express API
		const response = await fetch(`${EXPRESS_API_URL}/api/download-video`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		// For SSE responses, we need to stream the response back
		if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
			// Create a new readable stream from the response body
			const stream = response.body;

			// Return the stream as a Response
			return new Response(stream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
				},
			});
		}

		// For non-SSE responses (errors, etc.)
		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error('Error proxying to express server:', error);
		return NextResponse.json(
			{ error: 'Failed to download video' },
			{ status: 500 },
		);
	}
}
