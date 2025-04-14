import { NextResponse } from 'next/server';

const EXPRESS_API_URL =
	process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:8080';

interface FormatRequest {
	url: string;
}

export async function POST(request: Request) {
	try {
		const body: FormatRequest = await request.json();

		// Forward the request to Express API
		console.log('Api URL:', `${EXPRESS_API_URL}/api/fetch-formats`);
		const response = await fetch(`${EXPRESS_API_URL}/api/fetch-formats`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		// Get response from Express API
		const data = await response.json();

		// Return the response
		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error('Error proxying to express server:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch video formats' },
			{ status: 500 },
		);
	}
}
