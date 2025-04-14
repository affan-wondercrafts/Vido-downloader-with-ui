const EXPRESS_API_URL =
	process.env.NEXT_PUBLIC_EXPRESS_API_URL || 'http://localhost:8080';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		console.log('express api url', EXPRESS_API_URL);

		const response = await fetch(`${EXPRESS_API_URL}/api/direct-download`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});

		// Pipe the stream response directly back to the client
		return new Response(response.body, {
			headers: {
				'Content-Type': response.headers.get('Content-Type')!,
				'Content-Disposition': response.headers.get('Content-Disposition')!,
			},
		});
	} catch (error) {
		console.error('Proxy error:', error);
		return new Response('Failed to download video', { status: 500 });
	}
}
