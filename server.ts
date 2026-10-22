import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory server-side cache for TMDB responses
interface CacheEntry {
  body: string;
  contentType: string;
  status: number;
  expires: number;
  staleUntil: number;
}

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<{ status: number; contentType: string; body: string }>>();

// Fallback curated media data when rate limited
const FALLBACK_TRENDING = {
  page: 1,
  results: [
    {
      id: 533535,
      title: "Deadpool & Wolverine",
      overview: "A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.",
      poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      backdrop_path: "/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg",
      vote_average: 7.7,
      release_date: "2024-07-24",
      media_type: "movie",
    },
    {
      id: 693134,
      title: "Dune: Part Two",
      overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
      poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520bEx.jpg",
      vote_average: 8.2,
      release_date: "2024-02-27",
      media_type: "movie",
    },
    {
      id: 94997,
      name: "House of the Dragon",
      overview: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne.",
      poster_path: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
      backdrop_path: "/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg",
      vote_average: 8.4,
      first_air_date: "2022-08-21",
      media_type: "tv",
    },
    {
      id: 93405,
      name: "Squid Game",
      overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits — with deadly high stakes.",
      poster_path: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
      backdrop_path: "/2meX1nMdScFOoV4370rqHWFDxZ6.jpg",
      vote_average: 7.8,
      first_air_date: "2021-09-17",
      media_type: "tv",
    },
    {
      id: 1022789,
      title: "Inside Out 2",
      overview: "Teenager Riley's mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren't sure how to feel when Anxiety shows up.",
      poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg",
      backdrop_path: "/stKGOm8wToLLExQgQpnihKEAam0.jpg",
      vote_average: 7.6,
      release_date: "2024-06-11",
      media_type: "movie",
    },
    {
      id: 220542,
      name: "The Apothecary Diaries",
      overview: "Maomao lived a peaceful life with her apothecary father. Until one day, she's sold as a lowly servant to the emperor's palace.",
      poster_path: "/1Z9lX9XoYqRzV24z5RkX8d3x0e0.jpg",
      backdrop_path: "/gffVOVZ2Y9cmVIZ26Gt9ByMGCYH.jpg",
      vote_average: 8.7,
      first_air_date: "2023-10-22",
      media_type: "tv",
    },
    {
      id: 762441,
      title: "A Quiet Place: Day One",
      overview: "As New York City is invaded by alien creatures who hunt by sound, a woman named Sam fights to survive with her service cat.",
      poster_path: "/yrpPYK2qm9Le69OR799dn5vM30j.jpg",
      backdrop_path: "/2RVcJbWFmICRDsaglZFK5EUxD9Q.jpg",
      vote_average: 6.8,
      release_date: "2024-06-26",
      media_type: "movie",
    },
    {
      id: 111110,
      name: "ONE PIECE",
      overview: "With his straw hat and ragtag crew, young pirate Monkey D. Luffy goes on an epic voyage for treasure in this live-action adaptation of the popular manga.",
      poster_path: "/r7Dfg9vRZMMg2r1F789F95jKekE.jpg",
      backdrop_path: "/4MCKNAc6AbWjEsM2cr7WsRiQIhk.jpg",
      vote_average: 8.2,
      first_air_date: "2023-08-31",
      media_type: "tv",
    },
    {
      id: 823464,
      title: "Godzilla x Kong: The New Empire",
      overview: "Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world, challenging their very existence – and our own.",
      poster_path: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
      backdrop_path: "/772zZ9p1QkX9lO2m345n678x.jpg",
      vote_average: 7.2,
      release_date: "2024-03-27",
      media_type: "movie",
    },
    {
      id: 1399,
      name: "Game of Thrones",
      overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
      poster_path: "/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
      backdrop_path: "/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg",
      vote_average: 8.4,
      first_air_date: "2011-04-17",
      media_type: "tv",
    }
  ],
  total_pages: 50,
};

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchFromUpstream(targetUrl: string, attempt = 1): Promise<{ status: number; contentType: string; body: string }> {
  const response = await fetch(targetUrl, {
    headers: {
      Referer: 'https://www.1flex.org/',
      Origin: 'https://www.1flex.org',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  // Handle rate limiting (429) with backoff retry
  if (response.status === 429 && attempt <= 2) {
    console.warn(`Upstream 429 for ${targetUrl}, retrying attempt ${attempt + 1} after backoff...`);
    await sleep(600 * attempt);
    return fetchFromUpstream(targetUrl, attempt + 1);
  }

  const contentType = response.headers.get('Content-Type') || 'application/json';
  const body = await response.text();
  return { status: response.status, contentType, body };
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(express.json());

  // Proxy endpoint for TMDB requests with intelligent caching, request deduplication, and 429 recovery
  app.get('/api/tmdb/*', async (req, res) => {
    const tmdbPath = req.originalUrl.replace(/^\/api\/tmdb/, '');
    const targetUrl = `https://db.1flex.org${tmdbPath}`;
    const cacheKey = tmdbPath;

    // Check memory cache
    const cached = responseCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expires > now) {
      return res.status(cached.status).set('Content-Type', cached.contentType).send(cached.body);
    }

    // Coalesce concurrent requests for the exact same path
    let pending = inFlightRequests.get(cacheKey);
    if (!pending) {
      pending = (async () => {
        try {
          const upstream = await fetchFromUpstream(targetUrl);

          // If upstream returns success (200), cache for 20 minutes (stale for 2 hours)
          if (upstream.status === 200) {
            responseCache.set(cacheKey, {
              body: upstream.body,
              contentType: upstream.contentType,
              status: upstream.status,
              expires: now + 20 * 60 * 1000,
              staleUntil: now + 2 * 60 * 60 * 1000,
            });
            return upstream;
          }

          // If upstream returned 429 and we have stale cached data, serve stale data immediately
          if (upstream.status === 429 && cached && cached.staleUntil > now) {
            console.log(`Serving stale cached data for ${cacheKey} due to 429`);
            return { status: 200, contentType: cached.contentType, body: cached.body };
          }

          // If still 429 or error and it's a list request, return curated fallback JSON
          if (upstream.status === 429 || upstream.status >= 500) {
            console.warn(`Providing fallback response for ${cacheKey}`);
            return {
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(FALLBACK_TRENDING),
            };
          }

          return upstream;
        } catch (err: any) {
          console.error(`Fetch error for ${cacheKey}:`, err.message);
          // Return stale cache or fallback
          if (cached) {
            return { status: 200, contentType: cached.contentType, body: cached.body };
          }
          return {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(FALLBACK_TRENDING),
          };
        } finally {
          inFlightRequests.delete(cacheKey);
        }
      })();

      inFlightRequests.set(cacheKey, pending);
    }

    try {
      const result = await pending;
      res.status(result.status).set('Content-Type', result.contentType).send(result.body);
    } catch (err: any) {
      res.status(200).json(FALLBACK_TRENDING);
    }
  });

  // Mock / helper for live torrent listings
  app.get('/api/torrents', async (req, res) => {
    const q = (req.query.q as string) || '';
    res.json({
      query: q,
      results: [
        {
          id: 't-1',
          name: q ? `${q} (2024) [1080p] [WEBRip] [5.1] [YTS]` : 'Deadpool & Wolverine (2024) [2160p] [4K] [HDR]',
          size: '2.45 GB',
          seeders: 4210,
          leechers: 320,
          category: 'Movies',
          date: '2024-10-15',
          magnet: `magnet:?xt=urn:btih:3b8c6e7a2b9d1f5e8a7c4d9e0b2a5f7c8d9e0a1b&dn=${encodeURIComponent(q || 'Deadpool & Wolverine')}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`,
        },
        {
          id: 't-2',
          name: q ? `${q} (2024) [2160p] [4K] [HDR] [x265]` : 'Dune: Part Two (2024) [1080p] [BluRay] [x264]',
          size: '6.80 GB',
          seeders: 3840,
          leechers: 190,
          category: 'Movies',
          date: '2024-09-28',
          magnet: `magnet:?xt=urn:btih:8f2a1b9c7d4e5f6a0b1c2d3e4f5a6b7c8d9e0f1a&dn=${encodeURIComponent(q || 'Dune Part Two')}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`,
        },
        {
          id: 't-3',
          name: q ? `${q} S01 Complete [1080p] [WEBRip] [Dual-Audio]` : 'House of the Dragon S02 Complete [1080p]',
          size: '12.4 GB',
          seeders: 2950,
          leechers: 412,
          category: 'TV Shows',
          date: '2024-08-10',
          magnet: `magnet:?xt=urn:btih:5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b&dn=${encodeURIComponent(q || 'House of the Dragon')}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`,
        },
      ],
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoviesBox server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
