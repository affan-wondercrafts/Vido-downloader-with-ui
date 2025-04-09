# Video Downloader Application

A modern web application for downloading videos from various platforms like YouTube, TikTok, Instagram, and more.

## Features

- Clean, responsive UI built with Next.js and Tailwind CSS
- Support for multiple video platforms
- Quality selection (resolution, audio)
- Real-time download progress
- Download history

## Prerequisites

- Node.js 18+
- yt-dlp installed on your system

## Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/video-downloader.git
cd video-downloader
```

2. Install dependencies

```bash
yarn install
```

3. Make sure yt-dlp is installed on your system

```bash
# On macOS with Homebrew
brew install yt-dlp

# On Ubuntu/Debian
sudo apt update
sudo apt install yt-dlp

# On Windows with Chocolatey
choco install yt-dlp
```

## Development

Run the development server:

```bash
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
yarn run build
yarn start
```

## License

MIT
