import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TextEncoder } from 'util';

export async function POST(request: Request) {
	try {
		const { url, formatId, isAudioOnly } = await request.json();

		if (!url || !formatId) {
			return NextResponse.json(
				{ error: 'URL and format ID are required' },
				{ status: 400 },
			);
		}

		const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
		await fs.ensureDir(downloadsDir);

		// Generate a timestamp-based unique ID for this download
		const timestamp = Date.now();
		const uniqueId = `${formatId}-${timestamp}`;

		// Step 1: Get video title for filename
		const videoTitle: string = await new Promise((resolve, reject) => {
			const infoProc = spawn('yt-dlp', [
				'--get-title',
				'--restrict-filenames',
				url,
			]);

			let output = '';
			let error = '';

			infoProc.stdout.on('data', (data) => (output += data.toString()));
			infoProc.stderr.on('data', (data) => (error += data.toString()));

			infoProc.on('close', (code) => {
				if (code === 0) resolve(output.trim());
				else reject(new Error(`Failed to get video title: ${error}`));
			});
		});

		// Better sanitization for the title
		const sanitizedTitle = videoTitle
			.replace(/[\/\\:*?"<>|]/g, '')
			.replace(/\s+/g, '_')
			.substring(0, 100); // Limit length

		console.log('Processing download for:', sanitizedTitle);

		// Modify output template to use the uniqueId and avoid format-specific naming
		const outputTemplate = path.join(
			downloadsDir,
			`${sanitizedTitle}-${uniqueId}.%(ext)s`,
		);

		// Step 2: Prepare yt-dlp args with better formatting
		const args = ['--no-playlist', '-o', outputTemplate, '--newline'];

		if (isAudioOnly) {
			args.push('-f', formatId);
		} else {
			if (url.includes('tiktok.com')) {
				args.push(
					'--socket-timeout',
					'60',
					'--no-check-certificates',
					'-f',
					formatId,
				);
			} else {
				args.push('-f', `${formatId}+bestaudio[ext=m4a]/bestaudio`);
				args.push('--merge-output-format', 'mp4');
			}
		}

		// Add URL at the end
		args.push(url);

		// let proc: ChildProcessWithoutNullStreams;
		// for (let i = 0; i < 1; i++) {
		const proc = spawn('yt-dlp', args);
		// }
		console.log('Running yt-dlp with args:', args);
		const encoder = new TextEncoder();

		// Step 3: Setup Server-Sent Event stream
		const stream = new ReadableStream({
			start(controller) {
				proc.stdout.on('data', (chunk) => {
					const line = chunk.toString();
					console.log('yt-dlp output:', line.trim());

					const match = line.match(
						/\[download\]\s+(\d+\.\d+)%\s+of\s+([\d.]+\w+)\s+at\s+([\d.]+\w+\/s)\s+ETA\s+(\d+:\d+)/,
					);
					if (match) {
						const [, percent, totalSize, speed, eta] = match;
						const progressData = {
							status: 'downloading',
							percent: parseFloat(percent),
							totalSize,
							speed,
							eta,
						};
						controller.enqueue(
							encoder.encode(`data: ${JSON.stringify(progressData)}\n\n`),
						);
					}
				});

				proc.stderr.on('data', (data) => {
					console.error('yt-dlp error:', data.toString());
				});

				proc.on('close', (code) => {
					console.log('yt-dlp process closed with code:', code);

					if (code === 0) {
						const files = fs.readdirSync(downloadsDir);
						const filename = files.find((f) =>
							f.startsWith(`${sanitizedTitle}-${uniqueId}`),
						);

						if (filename) {
							console.log('Download completed:', filename);
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({
										status: 'completed',
										filename,
										downloadPath: `/downloads/${filename}`,
									})}\n\n`,
								),
							);
						} else {
							console.error('Could not find downloaded file');
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({
										status: 'error',
										message: 'File not found after download',
									})}\n\n`,
								),
							);
						}
					} else {
						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									status: 'error',
									message: 'Download failed with code ' + code,
								})}\n\n`,
							),
						);
					}
					controller.close();
				});
			},
		});

		// Return the stream as Server-Sent Events
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	} catch (error) {
		console.error('Error downloading video:', error);
		return NextResponse.json(
			{
				error:
					'Failed to download video: ' +
					(error instanceof Error ? error.message : String(error)),
			},
			{ status: 500 },
		);
	}
}
