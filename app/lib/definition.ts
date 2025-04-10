export type Format = {
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

export type VideoInfo = {
	title: string;
	thumbnail: string;
	duration: number;
	formats: Format[];
	is_live: boolean;
	extractor: string;
};

export type DownloadProgress = {
	percent: number;
	totalSize: string;
	speed: string;
	eta: string;
	status: string;
	filename?: string;
	downloadPath?: string;
	message?: string;
};
