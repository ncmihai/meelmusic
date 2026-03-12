// ========================================
// Spotify/Music Metadata Service — Task 5.3 & 5.4
// Fetches Metadata (search, popular, album covers)
// *Pivot*: Bypassing Spotify's strict ClientCredentials browser block 
// by using the same open-source JioSaavn API wrapper we use for audio.
// ========================================

const MUSIC_API = 'https://jiosaavn-api-privatecvc2.vercel.app';

/** Map Saavn track to our internal Song type */
function mapTrack(track: any) {
  // Use high quality image if available
  const imgArray = track.image || [];
  const bestImage = imgArray.length > 0 ? imgArray[imgArray.length - 1].link : '';
  
  // Format artists correctly (handle arrays or strings)
  let artistName = "Unknown Artist";
  if (track.primaryArtists) {
    artistName = Array.isArray(track.primaryArtists) 
      ? track.primaryArtists.map((a: any) => a.name || a).join(', ')
      : String(track.primaryArtists);
  }

  return {
    id: track.id, 
    title: String(track.name || "Unknown").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
    artist: artistName.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
    cover_url: bestImage,
    // Saavn duration is usually in seconds string, convert to ms for App consistency
    duration_ms: track.duration ? parseInt(track.duration, 10) * 1000 : 0,
    album: track.album?.name,
  };
}

/**
 * Searches for tracks
 */
export async function searchSpotifySongs(query: string, limit = 20) {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`${MUSIC_API}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) throw new Error("Search Error");
    const data = await response.json();
    
    if (data.status === "SUCCESS" && data.data?.results) {
      const allTracks = data.data.results.map(mapTrack);
      
      // Deduplication: Keep only one version of a song per artist
      const uniqueTracks: typeof allTracks = [];
      const seenKeys = new Set<string>();
      
      for (const t of allTracks) {
        // Strip common redundant suffixes for stricter deduplication
        let cleanTitle = t.title.toLowerCase();
        cleanTitle = cleanTitle.replace(/\s*\(.*(remix|instrumental|edit|mix|version|radio|live).*\)/i, '').trim();
        cleanTitle = cleanTitle.replace(/\s*-.*(remix|instrumental|edit|mix|version|radio|live).*/i, '').trim();
        
        const key = `${cleanTitle}:::${t.artist.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueTracks.push(t);
        }
      }
      return uniqueTracks;
    }
    return [];
  } catch (err) {
    console.error("Search failed in proxy API:", err);
    return [];
  }
}

/**
 * Searches for albums
 */
export async function searchAlbums(query: string, limit = 10) {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${MUSIC_API}/search/albums?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error("Search Error");
    
    const data = await response.json();
    if (data.status === "SUCCESS" && data.data?.results) {
      return data.data.results.map((album: any) => {
        
        let parsedArtist = "Unknown";
        if (Array.isArray(album.primaryArtists) && album.primaryArtists.length > 0) {
           parsedArtist = album.primaryArtists.map((a: any) => a.name).join(', ').replace(/&amp;/g, "&");
        } else if (typeof album.primaryArtists === 'string') {
           parsedArtist = album.primaryArtists;
        }

        return {
          id: album.id,
          title: String(album.name || "Unknown").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
          artist: parsedArtist,
          cover_url: album.image && album.image.length > 0 ? album.image[album.image.length - 1].link : '',
          year: album.year || '',
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Album search failed:", err);
    return [];
  }
}

/**
 * Searches precisely for Artists
 */
export async function searchArtists(query: string, limit = 5) {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${MUSIC_API}/search/artists?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error("Search Error");
    
    const data = await response.json();
    if (data.status === "SUCCESS" && data.data?.results) {
      return data.data.results.map((artist: any) => ({
        id: artist.id,
        name: String(artist.title || artist.name || "Unknown").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&"),
        cover_url: artist.image && artist.image.length > 0 ? artist.image[artist.image.length - 1].link : '',
        role: artist.role || 'artist'
      }));
    }
    return [];
  } catch (err) {
    console.error("Artist search failed:", err);
    return [];
  }
}

/**
 * Gets "popular" / returning tracks (e.g. from a global top playlist)
 */
export async function getPopularSongs() {
  try {
    // English Top Songs playlist ID from Saavn
    const response = await fetch(`${MUSIC_API}/playlists?id=107312154`);
    if (!response.ok) throw new Error("Playlist Error");
    
    const data = await response.json();
    if (data.status === "SUCCESS" && data.data?.songs) {
      return data.data.songs.slice(0, 15).map(mapTrack);
    }
    return [];
  } catch (err) {
    console.error("Popular songs failed in proxy API:", err);
    return [];
  }
}

/**
 * Gets recommendations. Saavn doesn't have a direct 'genre' recommendation like Spotify,
 * so we fall back to fetching a curated Top/Trending English playlist to act as the "Made for you" grid.
 */
export async function getGenreRecommendations() {
  try {
     // Fetching 'Trending English' or similar curated list from Saavn
     const response = await fetch(`${MUSIC_API}/modules?language=english`);
     if (!response.ok) throw new Error("Modules Error");
     
     const data = await response.json();
     if (data.status === "SUCCESS" && data.data?.trending?.songs) {
       return data.data.trending.songs.slice(0, 15).map(mapTrack);
     }
     
     // Fallback to Popular
     return await getPopularSongs();
  } catch (err) {
    console.error("Recommendations failed in proxy API:", err);
    return [];
  }
}

/**
 * Gets recommendations based on a seed track (used for infinite play later)
 */
export async function getRecommendations(seedTrackId: string) {
  try {
    const response = await fetch(`${MUSIC_API}/songs/${seedTrackId}/suggestions`);
    if (!response.ok) throw new Error("Suggestions Error");
    
    const data = await response.json();
    if (data.status === "SUCCESS" && Array.isArray(data.data)) {
      return data.data.slice(0, 10).map(mapTrack);
    }
    return [];
  } catch(err) {
    return [];
  }
}
