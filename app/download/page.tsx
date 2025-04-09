'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
	Loader2,
	Check,
	// ChevronLeft,
	Download,
	AlertCircle,
} from 'lucide-react';

type DownloadProgress = {
	percent: number;
	totalSize: string;
	speed: string;
	eta: string;
	status: string;
	filename?: string;
	downloadPath?: string;
	message?: string;
};

export default function DownloadPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const url = searchParams.get('url');
	const formatId = searchParams.get('formatId');
	const isAudioOnly = searchParams.get('isAudioOnly') === 'true';

	const [progress, setProgress] = useState<DownloadProgress | null>(null);
	const [error, setError] = useState<string | null>(null);

	// useEffect(() => {
	// 	if (!url || !formatId) {
	// 		router.push('/');
	// 		return;
	// 	}

	// 	// let eventSource: EventSource;

	// 	const startDownload = async () => {
	// 		try {
	// 			const response = await fetch('/api/download', {
	// 				method: 'POST',
	// 				headers: {
	// 					'Content-Type': 'application/json',
	// 				},
	// 				body: JSON.stringify({ url, formatId, isAudioOnly }),
	// 			});

	// 			if (!response.ok && response.status !== 200) {
	// 				const error = await response.json();
	// 				throw new Error(error.message || 'Failed to start download');
	// 			}

	// 			const reader = response.body?.getReader();
	// 			const decoder = new TextDecoder();

	// 			if (!reader) {
	// 				throw new Error('Failed to read response');
	// 			}

	// 			while (true) {
	// 				const { done, value } = await reader.read();
	// 				console.log('value', value);
	// 				console.log('done', done);
	// 				if (done) {
	// 					break;
	// 				}

	// 				const text = decoder.decode(value);
	// 				console.log('decoded text', text);
	// 				const lines = text.split('\n\n');

	// 				for (const line of lines) {
	// 					if (line.startsWith('data: ')) {
	// 						try {
	// 							const data = JSON.parse(line.substring(6));
	// 							setProgress(data);

	// 							if (data.status === 'error') {
	// 								setError(data.message || 'Download failed');
	// 							}
	// 						} catch (e) {
	// 							console.error('Failed to parse event data:', e);
	// 						}
	// 					}
	// 				}
	// 			}
	// 		} catch (err) {
	// 			console.error('Error starting download:', err);
	// 			setError(
	// 				err instanceof Error ? err.message : 'Failed to start download',
	// 			);
	// 		}
	// 	};

	// 	startDownload();
	// }, [url, formatId, isAudioOnly, router]);

	useEffect(() => {
		if (!url || !formatId) {
			router.push('/');
			return;
		}

		const abortController = new AbortController();

		const startDownload = async () => {
			try {
				const response = await fetch('/api/download', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ url, formatId, isAudioOnly }),
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

		return () => {
			abortController.abort();
		};
	}, [url, formatId, isAudioOnly, router]);

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-4'>
			<div className='max-w-2xl mx-auto'>
				{/* <button
					onClick={() => router.back()}
					className='mb-6 flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium'
				>
					<ChevronLeft className='h-5 w-5' />
					Back
				</button> */}

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
								<p className='mt-2 text-gray-500 dark:text-gray-400'>{error}</p>
								<button
									onClick={() => router.push('/')}
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
								<a
									href={progress.downloadPath}
									download
									className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition inline-flex items-center gap-2'
								>
									<Download className='h-5 w-5' />
									Download File
								</a>
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
		</div>
	);
}
