import type { Song } from '../types';

// Points to our local MeelMusic Hybrid Engine (Node.js)
const LOCAL_API = 'http://localhost:3001/api';

/**
 * Searches for songs using the official Spotify Metadata API (via local proxy).
 */
export async function searchSpotifySongs(query: string, limit = 15): Promise<Song[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${LOCAL_API}/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
    if (!response.ok) throw new Error("Search Error");
    
    const data = await response.json();
    return data.tracks.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      artist: item?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      cover_url: item?.album?.images?.length > 0 ? item.album.images[0].url : 'https://placehold.co/300x300/181818/white?text=No+Cover',
      duration_ms: item.duration_ms,
      // The stream URL will be fetched lazily via YouTube when Play is hit!
      url: ''
    }));
  } catch (err) {
    console.error("Spotify search failed:", err);
    return [];
  }
}

/**
 * Searches for Albums via Spotify Metadata
 */
export async function searchAlbums(artistId: string, limit = 10) {
  if (!artistId.trim()) return [];
  try {
    const response = await fetch(`${LOCAL_API}/spotify/artists/${artistId}/albums?limit=${limit}`);
    if (!response.ok) throw new Error("Search Error");
    
    const data = await response.json();
    return data.map((album: any) => ({
      id: album.id,
      title: album.name,
      artist: album.artists.map((a: any) => a.name).join(', '),
      cover_url: album.images && album.images.length > 0 ? album.images[0].url : '',
      year: album.release_date ? album.release_date.split('-')[0] : ''
    }));
  } catch (err) {
    console.error("Albums fetch failed:", err);
    return [];
  }
}

/**
 * Fetches the complete metadata and tracklist for a specific Official Spotify Album via Node backend.
 */
export async function getAlbumDetails(albumId: string): Promise<{ albumInfo: any, tracks: Song[] } | null> {
  try {
    const response = await fetch(`${LOCAL_API}/spotify/albums/${albumId}`);
    if (!response.ok) throw new Error("Album details error");
    
    const album = await response.json();
    
    const mappedTracks: Song[] = album.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      cover_url: album?.images?.length > 0 ? album.images[0].url : 'https://placehold.co/300x300/181818/white?text=No+Cover',
      duration_ms: track.duration_ms,
      // URL is resolved via JioSaavn automatically inside `<AudioPlayer />` or offline storage!
      url: '' 
    }));
    
    return {
      albumInfo: {
        id: album.id,
        name: album.name,
        cover_url: album?.images?.length > 0 ? album.images[0].url : '',
        artist: album?.artists?.map((a: any) => a.name).join(', '),
        release_date: album.release_date,
        total_tracks: album.total_tracks
      },
      tracks: mappedTracks
    };
  } catch (err) {
    console.error("Failed to fetch Album details:", err);
    return null;
  }
}

/**
 * Searches precisely for Artists profiles
 */
export async function searchArtists(query: string, limit = 5) {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${LOCAL_API}/spotify/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`);
    if (!response.ok) throw new Error("Search Error");
    
    const data = await response.json();
    return data.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      cover_url: artist.images && artist.images.length > 0 ? artist.images[0].url : '',
      role: 'artist'
    }));
  } catch (err) {
    console.error("Artist search failed:", err);
    return [];
  }
}

/**
 * Gets "Top Tracks" for a specific Artist
 */
export async function getArtistTopTracks(artistId: string) {
  if (!artistId.trim()) return [];
  try {
    const response = await fetch(`${LOCAL_API}/spotify/artists/${artistId}/top-tracks`);
    if (!response.ok) throw new Error("Top tracks error");
    
    const data = await response.json();
    return data.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track?.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      cover_url: track?.album?.images?.length > 0 ? track.album.images[0].url : 'https://placehold.co/300x300/181818/white?text=No+Cover',
      duration_ms: track.duration_ms,
      url: ''
    }));
  } catch (err) {
    console.error("Top tracks search failed:", err);
    return [];
  }
}

/**
 * Mock function to return popular tracks (global recommendations)
 */
export async function getPopularSongs(): Promise<Song[]> {
  // We can fetch a known Spotify playlist here. For now, let's search a generic term like "hit".
  return searchSpotifySongs("top hits 2026", 15);
}

/**
 * Generates genre recommendations based on query
 */
export async function getGenreRecommendations(genre: string): Promise<Song[]> {
  return searchSpotifySongs(genre, 10);
}
