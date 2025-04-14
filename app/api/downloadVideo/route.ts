// app/api/downloadVideo/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { url, format } = await req.json();

		// Make the POST request to your backend Express API
		const response = await fetch('http://localhost:8080/api/download', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, format }),
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to download video' },
				{ status: 500 },
			);
		}

		// Return the video content as a response
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Set headers to download the file
		return new NextResponse(buffer, {
			headers: {
				'Content-Disposition': 'attachment; filename="video.mp4"',
				'Content-Type': 'video/mp4',
			},
		});
	} catch (error) {
		console.error('Error downloading video:', error);
		return NextResponse.json(
			{ error: 'Failed to process download request' },
			{ status: 500 },
		);
	}
}
