'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
import {
	ArrowDown,
	Check,
	Loader2,
	Video,
	// Music,
	Info,
	AlertCircle,
	ChevronLeft,
	Download,
	Music,
	// ChevronRight,
} from 'lucide-react';
import { DownloadProgress, Format, VideoInfo } from './lib/definition';
import { formatDuration, formatSize } from './lib/utils';
import VideoPreview from './components/videPreview';

export default function Home() {
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [fetching, setFetching] = useState(false);
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
	const [videoFormats, setVideoFormats] = useState<Format[]>([]);
	const [audioFormats, setAudioFormats] = useState<Format[]>([]);
	const [downloading, setDownloading] = useState(false);
	const [progress, setProgress] = useState<DownloadProgress | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!url) {
			setError('Please enter a video URL');
			return;
		}
		let validUrl: string;
		if (url.includes('tiktok.com')) {
			validUrl = url.split('?')[0];
		} else {
			validUrl = url;
		}

		setLoading(true);
		setError(null);

		try {
			// router.push(`/formats?url=${encodeURIComponent(validUrl)}`);
			setFetchLoading(true);

			async function fetchFormats() {
				try {
					const response = await fetch('/api/fetch-formats', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ url: validUrl }),
					});

					if (!response.ok) {
						throw new Error('Failed to fetch video formats');
					}

					const data = await response.json();
					if (data.error) {
						throw new Error(data.error);
					}

					const info = data.info;
					console.log('videoInfo', info);

					if (info.is_live) {
						setFetchError('Live videos are not supported');
						setLoading(false);
						return;
					}
					let thumbnailUrl = info.thumbnail;
					if (url.includes('instagram.com')) {
						fetch(
							`https://jsonlink.io/api/extract?url=${encodeURIComponent(
								thumbnailUrl,
							)}`,
						)
							.then((res) => res.json())
							.then((data) => (thumbnailUrl = data));
					}
					console.log('thumbnailUrl', thumbnailUrl);

					setVideoInfo({
						title: info.title,
						thumbnail: thumbnailUrl,
						duration: info.duration,
						formats: info.formats,
						is_live: info.is_live,
						extractor: info.extractor,
					});

					// Filter video formats
					// const TARGET_RESOLUTIONS = [2160, 1440, 1080, 720, 480, 360, 240, 144];
					const videoFormatMap: Record<number, Format> = {};

					// if (info.extractor.includes('instagram')) {
					if (url.includes('instagram.com')) {
						const formats = info.formats;
						for (let i = 0; i < formats.length; i++) {
							const f = formats[i];
							videoFormatMap[i] = f;
						}
					} else {
						const formats = info.formats;
						for (let i = 0; i < formats.length; i++) {
							const f = formats[i];
							if (f.vcodec !== 'none' && f.ext && f.format_id && f.filesize) {
								videoFormatMap[i] = f;
							}
						}
					}

					// Get audio formats
					const audioFormats = info.formats.filter(
						(f: Format) => f.vcodec === 'none' && f.acodec !== 'none',
					);

					setVideoFormats(Object.values(videoFormatMap));
					setAudioFormats(audioFormats);
					setLoading(false);
				} catch (err) {
					console.error('Error fetching formats:', err);
					setFetchError(
						err instanceof Error
							? err.message
							: 'Failed to fetch video formats',
					);
					setLoading(false);
				}
			}
			await fetchFormats();
			setFetchLoading(false);
			setFetching(true);
		} catch (err) {
			setFetchError('Failed to process URL');
			setLoading(false);
			console.error(err);
		}
	};

	const handleDownload = (formatId: string, isAudioOnly: boolean) => {
		setDownloading(true);
		if (!url || !formatId) {
			router.push('/');
			return;
		}

		let validUrl: string;
		if (url.includes('tiktok.com')) {
			validUrl = url.split('?')[0];
		} else {
			validUrl = url;
		}

		const abortController = new AbortController();

		const startDownload = async () => {
			try {
				const response = await fetch('/api/download', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ url: validUrl, formatId, isAudioOnly }),
					signal: abortController.signal,
				});

				if (!response.ok && response.status !== 200) {
					const error = await response.json();
					throw new Error(error.message || 'Failed to start download');
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) {
					throw new Error('Failed to read response');
				}

				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						break;
					}

					const text = decoder.decode(value);
					const lines = text.split('\n\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							try {
								const data = JSON.parse(line.substring(6));
								setProgress(data);

								if (data.status === 'error') {
									setError(data.message || 'Download failed');
								}
							} catch (e) {
								console.error('Failed to parse event data:', e);
							}
						}
					}
				}
			} catch (err) {
				if (err instanceof Error && err.name !== 'AbortError') {
					console.error('Error starting download:', err);
					setError(
						err instanceof Error ? err.message : 'Failed to start download',
					);
				}
			}
		};

		startDownload();
	};

	if (fetchLoading) {
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

	if (fetchError) {
		return (
			<div className='min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900'>
				<div className='max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center'>
					<AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
					<h2 className='mt-4 text-xl font-medium text-gray-900 dark:text-gray-100'>
						Error
					</h2>
					<p className='mt-2 text-gray-500 dark:text-gray-400'>{fetchError}</p>
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
		<main className='min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4'>
			{!fetching && !downloading ? (
				<div className='w-full max-w-3xl'>
					<div className='text-center mb-12'>
						<h1 className='text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400'>
							Video Downloader
						</h1>
						<p className='text-gray-600 dark:text-gray-300 text-lg'>
							Download videos from YouTube, TikTok, Instagram, and more
						</p>
					</div>

					<div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8'>
						<form
							onSubmit={handleSubmit}
							className='space-y-6'
						>
							<div className='space-y-2'>
								<label
									htmlFor='url'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300'
								>
									Video URL
								</label>
								<div className='relative rounded-lg shadow-sm'>
									<input
										type='text'
										id='url'
										placeholder='https://www.youtube.com/watch?v=...'
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										className='block w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									/>
									<div className='absolute inset-y-0 right-0 flex items-center pr-3'>
										<Video className='h-5 w-5 text-gray-400 dark:text-gray-500' />
									</div>
								</div>
							</div>

							{error && (
								<div className='text-red-500 text-sm font-medium flex items-center gap-1'>
									<Info className='h-4 w-4' />
									{error}
								</div>
							)}

							<button
								type='submit'
								disabled={loading}
								className='w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70'
							>
								{loading ? (
									<>
										<Loader2 className='h-5 w-5 animate-spin' />
										Processing...
									</>
								) : (
									<>
										<ArrowDown className='h-5 w-5' />
										Get Download Options
									</>
								)}
							</button>
						</form>
					</div>
					{url && <VideoPreview videoUrl={url} />}
					<div className='space-y-6'>
						<div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md'>
							<h3 className='font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
								<Check className='h-5 w-5 text-green-500' />
								Supports Many Platforms
							</h3>
							<p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
								YouTube, TikTok, Instagram, Twitter, Facebook, and hundreds more
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md'>
							<h3 className='font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
								<Check className='h-5 w-5 text-green-500' />
								Multiple Format Options
							</h3>
							<p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
								Choose from different resolutions and audio qualities
							</p>
						</div>

						<div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md'>
							<h3 className='font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
								<Check className='h-5 w-5 text-green-500' />
								Fast & Reliable
							</h3>
							<p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
								Advanced downloading engine for quick and stable downloads
							</p>
						</div>
					</div>
				</div>
			) : !downloading ? (
				<div className='max-w-4xl mx-auto'>
					<button
						onClick={() => setFetching(false)}
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

								{videoInfo.thumbnail ? (
									<div className='relative rounded-lg overflow-hidden mb-4 aspect-video flex items-center justify-center'>
										<img
											src={videoInfo.thumbnail || ''}
											alt={videoInfo.title}
											className='object-contains h-full'
										/>
									</div>
								) : (
									<div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
										<div className='w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center'>
											<Video className='h-8 w-8 text-blue-600' />
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
													(a, b) =>
														(b.abr || b.asr || 0) - (a.abr || a.asr || 0),
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
			) : (
				<div className='md:min-w-2xl mx-auto'>
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden'>
						<div className='p-6'>
							<h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
								{progress?.status === 'completed'
									? 'Download Complete'
									: 'Downloading...'}
							</h1>

							{error ? (
								<div className='text-center py-8'>
									<AlertCircle className='h-12 w-12 text-red-500 mx-auto' />
									<h2 className='mt-4 text-xl font-medium text-gray-900 dark:text-gray-100'>
										Download Failed
									</h2>
									<p className='mt-2 text-gray-500 dark:text-gray-400'>
										{error}
									</p>
									<button
										onClick={() => {
											setDownloading(false);
											setFetching(false);
											// setUrl('');
											setProgress(null);
										}}
										className='mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition'
									>
										Try Again
									</button>
								</div>
							) : progress?.status === 'completed' ? (
								<div className='text-center py-8'>
									<div className='w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4'>
										<Check className='h-8 w-8 text-green-500' />
									</div>
									<p className='text-gray-700 dark:text-gray-300 mb-8'>
										Your download has been completed successfully!
									</p>
									<button
										// href={progress.downloadPath}
										onClick={() => {
											setDownloading(false);
											setFetching(false);
											setUrl('');
											setProgress(null);
										}}
										className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition inline-flex items-center gap-2'
									>
										{/* <Download className='h-5 w-5' /> */}
										Back to Home
									</button>
									<p className='text-sm text-gray-500 dark:text-gray-400 mt-4'>
										{progress.filename}
									</p>
								</div>
							) : (
								<div className='py-4'>
									<div className='mb-6'>
										<div className='flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1'>
											<span>{progress?.percent?.toFixed(1)}%</span>
											<span>{progress?.totalSize}</span>
										</div>
										<div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
											<div
												className='bg-blue-600 h-2 rounded-full transition-all duration-300'
												style={{ width: `${progress?.percent || 0}%` }}
											></div>
										</div>
									</div>

									<div className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4'>
										<div className='grid grid-cols-2 gap-y-2'>
											<div className='text-sm text-gray-500 dark:text-gray-400'>
												Speed:
											</div>
											<div className='text-sm text-gray-900 dark:text-gray-100 font-medium'>
												{progress?.speed || 'Calculating...'}
											</div>

											<div className='text-sm text-gray-500 dark:text-gray-400'>
												Estimated time:
											</div>
											<div className='text-sm text-gray-900 dark:text-gray-100 font-medium'>
												{progress?.eta || 'Calculating...'}
											</div>
										</div>
									</div>

									<div className='flex justify-center mt-6'>
										<div className='flex items-center gap-3'>
											<Loader2 className='h-5 w-5 animate-spin text-blue-500' />
											<span className='text-gray-600 dark:text-gray-300'>
												Processing download...
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
