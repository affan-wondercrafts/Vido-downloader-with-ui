'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowDown,
	Check,
	Loader2,
	Video,
	// Music,
	Info,
	// ChevronRight,
} from 'lucide-react';

export default function Home() {
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!url) {
			setError('Please enter a video URL');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			router.push(`/formats?url=${encodeURIComponent(url)}`);
		} catch (err) {
			setError('Failed to process URL');
			setLoading(false);
			console.error(err);
		}
	};

	return (
		<main className='min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4'>
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
		</main>
	);
}
