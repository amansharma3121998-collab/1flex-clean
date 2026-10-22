# MoviesBox - Stream Movies & TV Shows

MoviesBox is an entertainment streaming web platform built as a modern, lightning-fast **React + Vite** single-page application with an Express backend proxy.

## Features

- **Movies & TV Series**: Browse trending titles, popular releases, critically acclaimed movies, and top-rated TV shows powered by high-resolution TMDB data.
- **Top 10 Today**: Netflix-style top 10 rows with oversized iconic typography numbers.
- **Continue Watching**: Real-time progress tracking stored across sessions in localStorage.
- **Detailed Modals**: Full synopses, age certifications, match percentages, cast thumbnails, similar recommendations, and TV season/episode selectors.
- **Multi-Server Streaming Player**: Embedded video player supporting fast switching between 6 high-definition streaming servers (VidLink, VidSrc Pro, VidSrc XYZ, AutoEmbed, SmashyStream, 2Embed) and episode navigation.
- **My List & Profiles**: Netflix-style profile manager ("Who's Watching?"), custom avatars, and watchlist persistence.

## Architecture

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / Proxy**: Express server on Node.js 22 proxying TMDB requests with correct origin headers, eliminating CORS restrictions.
- **Dev Server**: Runs on `http://0.0.0.0:3000`.
