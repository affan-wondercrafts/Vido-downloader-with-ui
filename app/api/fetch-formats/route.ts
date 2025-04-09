import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: Request) {
	try {
		const { url } = await request.json();

		if (!url) {
			return NextResponse.json({ error: 'URL is required' }, { status: 400 });
		}
		console.time('yt-dlp-fetch');
		const formatsJson = await new Promise<string>((resolve, reject) => {
			// const proc = spawn('yt-dlp', ['-J', url]);
			const proc = spawn('yt-dlp', [
				'--skip-download',
				'--no-warnings',
				'--no-check-certificate',
				'--dump-json',
				'--no-playlist',
				url,
			]);

			let data = '';
			proc.stdout.on('data', (chunk) => (data += chunk.toString()));
			proc.stderr.on('data', (err) => {
				console.error(err.toString());
			});

			proc.on('close', (code) => {
				console.timeEnd('yt-dlp-fetch');
				if (code === 0) resolve(data);
				else reject('Failed to fetch formats');
			});
		});

		const info = JSON.parse(formatsJson);
		return NextResponse.json({ info });
	} catch (error) {
		console.error('Error fetching formats:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch video formats' },
			{ status: 500 },
		);
	}
}
