import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Video Downloader',
	description: 'Download videos from YouTube, TikTok, Instagram, and more',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<div className='container mx-auto'>
					<header className='py-4 px-4'>
						<nav className='flex justify-between items-center'>
							<div className='flex items-center gap-2'>
								<div className='bg-blue-600 text-white h-8 w-8 rounded-lg flex items-center justify-center'>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-5 w-5'
										viewBox='0 0 20 20'
										fill='currentColor'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
											clipRule='evenodd'
										/>
									</svg>
								</div>
								<span className='font-bold text-lg text-gray-900 dark:text-white'>
									VideoDownloader
								</span>
							</div>
							<div>
								<Link
									href='/'
									className='text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
								>
									Home
								</Link>
							</div>
						</nav>
					</header>
					{children}
					<footer className='py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400'>
						<p>
							© {new Date().getFullYear()} Video Downloader. All rights
							reserved.
						</p>
						<p className='mt-1'>Powered by Next.js and yt-dlp</p>
					</footer>
				</div>
			</body>
		</html>
	);
}
