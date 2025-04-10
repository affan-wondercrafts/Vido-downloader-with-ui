import React from 'react';
import { getPlatformEmbedUrl } from '../lib/utils';
import { Play } from 'lucide-react';

const VideoPreview = ({
	videoUrl,
	thumbnail,
}: {
	videoUrl: string;
	thumbnail?: string;
}) => {
	const platform = getPlatformEmbedUrl(videoUrl);

	if (!platform) {
		return <div>Video platform not supported or invalid URL</div>;
	}

	return (
		<div className='flex flex-col items-center justify-center w-full mx-auto'>
			<h1>{platform.platform} Video Preview</h1>
			{platform.platform === 'TikTok' && (
				<iframe
					src={platform.embedUrl}
					width='100%'
					height='500'
					frameBorder='0'
					allow='autoplay; encrypted-media'
					allowFullScreen
				/>
			)}
			{platform.platform === 'YouTube' && (
				<iframe
					src={platform.embedUrl}
					width='100%'
					height='500'
					frameBorder='0'
					allow='autoplay; encrypted-media'
					allowFullScreen
				/>
			)}
			{platform.platform === 'Instagram' && (
				<div>
					{/* <iframe
						src={platform.embedUrl}
						width='100%'
						height='500'
						frameBorder='0'
						scrolling='no'
						allow='autoplay; encrypted-media'
					/> */}
					<a
						href={videoUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='relative w-full max-w-md  group flex items-center justify-center'
					>
						<div className='aspect-[9/16] bg-gray-200 rounded-xl overflow-hidden'>
							{thumbnail ? (
								<img
									src={thumbnail}
									alt='Preview'
									className='object-cover w-full h-full'
								/>
							) : (
								<div className='flex items-center justify-center w-full h-full text-gray-500 text-center p-4'>
									No preview available. Click to view.
								</div>
							)}
						</div>
						<div className='absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition'>
							<Play className='text-white text-3xl' />
						</div>
					</a>
				</div>
			)}
			{/* You can add more platform-specific logic here */}
		</div>
	);
};

export default VideoPreview;
