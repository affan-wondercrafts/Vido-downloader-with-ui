'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Clock, Download, Trash2 } from 'lucide-react';
// import path from 'path';
// import fs from 'fs-extra';

type DownloadedFile = {
	name: string;
	size: string;
	date: string;
	path: string;
};

export default function HistoryPage() {
	const router = useRouter();
	const [downloads, setDownloads] = useState<DownloadedFile[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// In a real app, you'd fetch this from an API
		// Here we're mocking the data for demonstration
		const fetchDownloads = async () => {
			try {
				setLoading(true);

				// This would be your API call in a real implementation
				// const response = await fetch('/api/downloads');
				// const data = await response.json();

				// Mock data for demonstration
				const mockData: DownloadedFile[] = [
					{
						name: 'Funny cats compilation.mp4',
						size: '45.2 MB',
						date: '2025-04-08',
						path: '/downloads/funny-cats-compilation.mp4',
					},
					{
						name: 'Tutorial - How to build a Next.js app.mp4',
						size: '128.7 MB',
						date: '2025-04-07',
						path: '/downloads/nextjs-tutorial.mp4',
					},
					{
						name: 'Lofi beats to study to.m4a',
						size: '18.3 MB',
						date: '2025-04-06',
						path: '/downloads/lofi-beats.m4a',
					},
				];

				setDownloads(mockData);
				setLoading(false);
			} catch (error) {
				console.error('Failed to fetch download history:', error);
				setLoading(false);
			}
		};

		fetchDownloads();
	}, []);

	const handleDelete = async (filePath: string) => {
		// This would call an API endpoint to delete the file in a real app
		setDownloads(downloads.filter((download) => download.path !== filePath));
	};

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

				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden'>
					<div className='p-6 border-b border-gray-200 dark:border-gray-700'>
						<h1 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
							<Clock className='h-6 w-6 text-blue-500' />
							Download History
						</h1>
					</div>

					{loading ? (
						<div className='p-8 text-center'>
							<div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto'></div>
							<p className='mt-4 text-gray-500 dark:text-gray-400'>
								Loading download history...
							</p>
						</div>
					) : downloads.length > 0 ? (
						<div className='divide-y divide-gray-200 dark:divide-gray-700'>
							{downloads.map((download, index) => (
								<div
									key={index}
									className='p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition'
								>
									<div className='flex items-center justify-between'>
										<div className='flex-1 min-w-0'>
											<h3 className='text-lg font-medium text-gray-900 dark:text-white truncate'>
												{download.name}
											</h3>
											<div className='flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400'>
												<span>{download.size}</span>
												<span>{download.date}</span>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											<a
												href={download.path}
												download
												className='p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full'
											>
												<Download className='h-5 w-5' />
											</a>
											<button
												onClick={() => handleDelete(download.path)}
												className='p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full'
											>
												<Trash2 className='h-5 w-5' />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='p-8 text-center'>
							<p className='text-gray-500 dark:text-gray-400'>
								No download history available.
							</p>
							<button
								onClick={() => router.push('/')}
								className='mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition'
							>
								Download Your First Video
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
