const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

// Load environment variables from the parent meelmusic folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const CACHE_FILE = path.join(__dirname, 'yt_cache.json');

// --- Simple Persistent Database for YouTube IDs ---
// Aceasta baza asigura ca o piesa cautata o data nu mai face request de cautare catre YouTube niciodata
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

let ytIdCache = loadCache();

// --- Spotify Token Management ---
let spotifyToken = '';
let tokenExpiration = 0;

async function getSpotifyToken() {
  if (Date.now() < tokenExpiration && spotifyToken) {
    return spotifyToken;
  }

  const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Lipsesc Spotify Credentials din .env');
  }

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authString}`
        }
      }
    );

    spotifyToken = response.data.access_token;
    // Expiră cu 60 secunde înainte de termenul oficial pentru siguranță (de obicei e 3600 secunde)
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
    return spotifyToken;
  } catch (error) {
    console.error('Eroare la obținerea tokenului Spotify:', error.response?.data || error.message);
    throw error;
  }
}

// --- Rută: Căutare generală (Tracks & Artists) ---
app.get('/api/spotify/search', async (req, res) => {
  try {
    const { q, type = 'track,artist', limit = 15 } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter "q" is required' });

    const token = await getSpotifyToken();
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=${type}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Search Spotify API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch from Spotify API' });
  }
});

// --- Rută: Obține albumele unui artist ---
app.get('/api/spotify/artists/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    const token = await getSpotifyToken();
    
    // Obținem doar albumele și single-urile oficiale din US pentru relevanță maximă
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&market=US&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Search Albums API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch albums from Spotify API' });
  }
});

// --- Rută: Obține top tracks-urile unui artist ---
app.get('/api/spotify/artists/:id/top-tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getSpotifyToken();
    
    const response = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data.tracks);
  } catch (error) {
    console.error('Top Tracks API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch top tracks from Spotify API' });
  }
});

// --- Rută: Obținere Detalii + Piese dintr-un Album Specific ---
app.get('/api/spotify/albums/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getSpotifyToken();
    
    // Obținem direct Albumul (care conține și tracks.items implicit în Spotify API)
    const response = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Spotify album:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch album data' });
  }
});

// --- Rută: YouTube Stream URL Extraction & Direct Pipe ---
app.get('/api/youtube/stream', async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: 'Piesa nu are nume pentru căutarea YouTube' });

  const cacheKey = title.trim().toLowerCase();
  
  try {
    let videoId = ytIdCache[cacheKey];

    // Dacă NU avem id-ul piesei in baza de date, il cautam pe YouTube
    if (!videoId) {
      console.log(`[🔎 Caut pe YouTube] ${title}`);
      const r = await yts(`${title} audio official`);
      const video = r.videos[0];
      
      if (!video) {
          return res.status(404).json({ error: "Niciun video găsit pe YouTube." });
      }
      
      videoId = video.videoId;
      ytIdCache[cacheKey] = videoId;
      saveCache(ytIdCache); // Salvam in "database" (fisier JSON)
    } else {
      console.log(`[⚡ Gasit in DB] ${title} -> ${videoId}`);
    }

    // Pipes direct audio bytes to the browser bypassing YouTube blocking logic
    res.setHeader('Content-Type', 'audio/webm'); // ytdl returns webm/mp4 audio chunks
    
    // In caz de deconectare a clientului (a dat skip), oprim descarcarea
    const stream = ytdl(videoId, { filter: 'audioonly', quality: 'highestaudio' });
    
    // Oprim teava daca primim erori de la ytdl (ex blockuri temporare youtube)
    stream.on('error', (err) => {
      console.error(`Eroare la extragerea stream-ului: ${err.message}`);
      if (!res.headersSent) res.status(500).end();
    });

    // Pipering the stream to the frontend response
    stream.pipe(res);

  } catch (err) {
    console.error('YouTube Extraction Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Eroare internă la extragerea MP3-ului de pe YouTube." });
    }
  }
});


// Pornire
app.listen(PORT, () => {
  console.log(`🚀 MeelMusic Hybrid Backend pornit la http://localhost:${PORT}`);
  console.log('✅ Folosește Spotify API pentru Metadata & YouTube pentru Audio Streaming.');
});
