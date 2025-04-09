'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
	Loader2,
	ChevronLeft,
	Video,
	Music,
	AlertCircle,
	// Check,
	Download,
	Info,
} from 'lucide-react';

type Format = {
	format_id: string;
	ext: string;
	height?: number;
	width?: number;
	filesize?: number;
	filesize_approx?: number;
	vcodec: string;
	acodec: string;
	abr?: number;
	asr?: number;
};

type VideoInfo = {
	title: string;
	thumbnail: string;
	duration: number;
	formats: Format[];
	is_live: boolean;
	extractor: string;
};

function formatSize(format: Format) {
	const size = format.filesize || format.filesize_approx;
	return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'Size N/A';
}

function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function FormatsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const url = searchParams.get('url');

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
	const [videoFormats, setVideoFormats] = useState<Format[]>([]);
	const [audioFormats, setAudioFormats] = useState<Format[]>([]);

	useEffect(() => {
		if (!url) {
			router.push('/');
			return;
		}

		async function fetchFormats() {
			try {
				const response = await fetch('/api/fetch-formats', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ url }),
				});

				if (!response.ok) {
					throw new Error('Failed to fetch video formats');
				}

				const data = await response.json();
				if (data.error) {
					throw new Error(data.error);
				}

				const info = data.info;

				if (info.is_live) {
					setError('Live videos are not supported');
					setLoading(false);
					return;
				}

				setVideoInfo({
					title: info.title,
					thumbnail: info.thumbnail,
					duration: info.duration,
					formats: info.formats,
					is_live: info.is_live,
					extractor: info.extractor,
				});

				// Filter video formats
				// const TARGET_RESOLUTIONS = [2160, 1440, 1080, 720, 480, 360, 240, 144];
				const videoFormatMap: Record<number, Format> = {};

				// if (info.extractor.includes('instagram')) {
				const formats = info.formats;
				for (let i = 0; i < formats.length; i++) {
					const f = formats[i];
					if (f.vcodec !== 'none' && f.ext && f.format_id && f.filesize) {
						videoFormatMap[i] = f;
					}
				}
				// } else {
				// 	for (const res of TARGET_RESOLUTIONS) {
				// 		const preferred = info.formats
				// 			.filter(
				// 				(f: Format) =>
				// 					(f.filesize || f.filesize_approx) && f.ext && f.format_id,
				// 			)
				// 			.find(
				// 				(f: Format) =>
				// 					f.height === res &&
				// 					(f.ext === 'mp4' || f.ext === 'webm') &&
				// 					f.vcodec !== 'none',
				// 			);

				// 		if (preferred) {
				// 			videoFormatMap[res] = preferred;
				// 		}
				// 	}
				// }

				// Get audio formats
				const audioFormats = info.formats.filter(
					(f: Format) => f.vcodec === 'none' && f.acodec !== 'none',
				);

				setVideoFormats(Object.values(videoFormatMap));
				setAudioFormats(audioFormats);
				setLoading(false);
			} catch (err) {
				console.error('Error fetching formats:', err);
				setError(
					err instanceof Error ? err.message : 'Failed to fetch video formats',
				);
				setLoading(false);
			}
		}

		fetchFormats();
	}, [url, router]);

	const handleDownload = (formatId: string, isAudioOnly: boolean) => {
		router.push(
			`/download?url=${encodeURIComponent(
				url as string,
			)}&formatId=${formatId}&isAudioOnly=${isAudioOnly}`,
		);
	};

	if (loading) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900'>
				<div className='text-center'>
					<Loader2 className='h-12 w-12 animate-spin mx-auto text-blue-500' />
					<h2 className='mt-4 text-xl font-medium text-gray-900 dark:text-gray-100'>
						Fetching video formats...
					</h2>
					<p className='mt-2 text-gray-500 dark:text-gray-400'>
						This may take a moment
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900'>
				<div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center'>
					<AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
					<h2 className='mt-4 text-xl font-medium text-gray-900 dark:text-gray-100'>
						Error
					</h2>
					<p className='mt-2 text-gray-500 dark:text-gray-400'>{error}</p>
					<button
						onClick={() => router.push('/')}
						className='mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200'
					>
						<ChevronLeft className='h-5 w-5' />
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4'>
			<div className='max-w-4xl mx-auto'>
				<button
					onClick={() => router.push('/')}
					className='mb-6 flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium'
				>
					<ChevronLeft className='h-5 w-5' />
					Back to Home
				</button>

				{videoInfo && (
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8'>
						<div className='p-6'>
							<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2'>
								{videoInfo.title}
							</h1>

							<div className='flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4'>
								<span>{videoInfo.extractor}</span>
								<span>•</span>
								<span>{formatDuration(videoInfo.duration)}</span>
							</div>

							{videoInfo.thumbnail && (
								<div className='relative rounded-lg overflow-hidden mb-4 aspect-video'>
									<img
										src={videoInfo.thumbnail}
										alt={videoInfo.title}
										className='w-full h-full object-cover'
									/>
									<div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
										<div className='w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center'>
											<Video className='h-8 w-8 text-blue-600' />
										</div>
									</div>
								</div>
							)}
						</div>

						<div className='border-t border-gray-200 dark:border-gray-700'>
							<div className='p-6'>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
									<Video className='h-5 w-5 text-blue-500' />
									Video Formats
								</h2>

								{videoFormats.length > 0 ? (
									<div className='space-y-3'>
										{videoFormats
											.sort((a, b) => (b.height || 0) - (a.height || 0))
											.map((format) => (
												<div
													key={format.format_id}
													className='flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition'
												>
													<div>
														<div className='font-medium text-gray-900 dark:text-white'>
															{format.height}p {format.ext.toUpperCase()}
														</div>
														<div className='text-sm text-gray-500 dark:text-gray-400'>
															{formatSize(format)}
														</div>
													</div>

													<button
														onClick={() =>
															handleDownload(format.format_id, false)
														}
														className='flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition'
													>
														<Download className='h-4 w-4' />
														Download
													</button>
												</div>
											))}
									</div>
								) : (
									<div className='text-center py-4 text-gray-500 dark:text-gray-400'>
										No video formats available
									</div>
								)}
							</div>

							<div className='border-t border-gray-200 dark:border-gray-700 p-6'>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
									<Music className='h-5 w-5 text-green-500' />
									Audio Only
								</h2>

								{audioFormats.length > 0 ? (
									<div className='space-y-3'>
										{audioFormats
											.sort(
												(a, b) => (b.abr || b.asr || 0) - (a.abr || a.asr || 0),
											)
											.slice(0, 3)
											.map((format) => (
												<div
													key={format.format_id}
													className='flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition'
												>
													<div>
														<div className='font-medium text-gray-900 dark:text-white'>
															{format.ext.toUpperCase()} •{' '}
															{format.abr || format.asr || 'N/A'} kbps
														</div>
														<div className='text-sm text-gray-500 dark:text-gray-400'>
															{formatSize(format)}
														</div>
													</div>

													<button
														onClick={() =>
															handleDownload(format.format_id, true)
														}
														className='flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition'
													>
														<Download className='h-4 w-4' />
														Download
													</button>
												</div>
											))}
									</div>
								) : (
									<div className='text-center py-4 text-gray-500 dark:text-gray-400'>
										No audio formats available
									</div>
								)}
							</div>
						</div>
					</div>
				)}

				<div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg p-4'>
					<div className='flex gap-3'>
						<Info className='h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5' />
						<div>
							<p className='text-sm text-gray-700 dark:text-gray-300'>
								Downloads are processed on the server. Once complete,
								you&apos;ll be able to download the file to your device.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
