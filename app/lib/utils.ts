import { Format } from './definition';

export function formatSize(format: Format) {
	const size = format.filesize || format.filesize_approx;
	return size ? `${(size / 1024 / 1024).toFixed(2)} MB` : 'Size N/A';
}

export function formatDuration(seconds: number) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const getPlatformEmbedUrl = (url: string) => {
	// TikTok
	if (url.includes('tiktok.com')) {
		return {
			embedUrl: `https://www.tiktok.com/embed/${
				url?.split('/')?.pop()?.split('?')[0]
			}`,
			platform: 'TikTok',
		};
	}
	// YouTube
	if (url.includes('youtube.com') || url.includes('youtu.be')) {
		const videoId = new URL(url).searchParams.get('v') || url.split('/').pop();
		return {
			embedUrl: `https://www.youtube.com/embed/${videoId}`,
			platform: 'YouTube',
		};
	}
	// Instagram
	if (url.includes('instagram.com')) {
		const postId = url.split('/')[4]; // Extract the post ID from Instagram URL
		return {
			embedUrl: `https://www.instagram.com/p/${postId}/embed`,
			platform: 'Instagram',
		};
	}
	// Add more platforms as needed...
	return null;
};
