// ========================================
// Audio Service — Hybrid Engine (Phase 11.5)
// Reliably fetches direct MP4 stream URLs perfectly aligned with Spotify Metadata
// ========================================

const JIOSAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=';

// Simple RAM cache to prevent duplicate backend queries for the same song during a session
const streamCache = new Map<string, string>();

/**
 * Searches for a song via JioSaavn CDN and returns the direct Audio Stream.
 * This completely bypasses YouTube's strict 403 IP blockades while preserving the Spotify UX.
 */
export async function getAudioStream(title: string, artist: string): Promise<string | null> {
  const query = `${title} ${artist}`.replace(/[^a-zA-Z0-9 ]/g, ' ');
  const cacheKey = `${query.toLowerCase()}`;
  
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`${JIOSAAVN_API}${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`JioSaavn API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.status === "SUCCESS" && data.data?.results?.length > 0) {
      const topResult = data.data.results[0];
      
      if (topResult.downloadUrl && topResult.downloadUrl.length > 0) {
        // Obținem calitatea maximă de 320kbps MP4
        const streamUrl = topResult.downloadUrl[topResult.downloadUrl.length - 1].link;
        console.log(`✅ Extracted Piped Audio CDN for: ${title}`);
        streamCache.set(cacheKey, streamUrl);
        return streamUrl;
      }
    }
    
    console.warn('❌ No reliable CDN stream found for:', title);
    return null;
    
  } catch (error) {
    console.error('Error fetching stream from CDN Pipeline:', error);
    return null;
  }
}

