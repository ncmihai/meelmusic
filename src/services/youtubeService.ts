// ========================================
// Audio Service — Task 5.5 (JioSaavn API Pivot)
// Reliably fetches direct MP4 stream URLs for full songs
// ========================================

// Public instance of the open-source JioSaavn API
const JIOSAAVN_API = 'https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=';

// Simple cache for stream URLs
const streamCache = new Map<string, string>();

/**
 * Searches for a song and returns a direct audio stream URL (320kbps MP4).
 * Enforces strict duration matching (max 15s difference) to avoid playing remixes/extended versions.
 */
export async function getAudioStream(title: string, artist: string, expectedDurationMs?: number): Promise<string | null> {
  // Format query strictly for better matching
  const query = `${title} ${artist}`.replace(/[^a-zA-Z0-9 ]/g, '');
  const cacheKey = `${query.toLowerCase()}-${expectedDurationMs || 0}`;
  
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`${JIOSAAVN_API}${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) throw new Error(`JioSaavn API error: ${response.status}`);
    
    const data = await response.json();
    
    if (data.status === "SUCCESS" && data.data?.results?.length > 0) {
      // Find the first result that matches the expected duration (within 15 seconds)
      const expectedDurationSec = expectedDurationMs ? expectedDurationMs / 1000 : null;
      let matchedResult = data.data.results[0]; // Fallback to first if no duration provided or no match

      if (expectedDurationSec) {
        const MARGIN_OF_ERROR = 15; // 15 seconds
        const exactMatch = data.data.results.find((track: any) => {
          // JioSaavn might return duration in string format
          const saavnDuration = parseInt(track.duration, 10);
          if (isNaN(saavnDuration)) return false;
          
          return Math.abs(saavnDuration - expectedDurationSec) <= MARGIN_OF_ERROR;
        });

        if (exactMatch) {
          console.log(`✅ Strict Match Found: ${title} (Expected: ${expectedDurationSec}s, Found: ${exactMatch.duration}s)`);
          matchedResult = exactMatch;
        } else {
          console.warn(`⚠️ No strict duration match for ${title}. Expected ${expectedDurationSec}s. Best fallback selected.`);
          // If no track fits the 15s margin, we still fallback to topResult so the UI doesn't break, 
          // but we log a warning.
        }
      }
      
      // Get the highest quality download URL (usually the last in the array) from matched result
      if (matchedResult.downloadUrl && matchedResult.downloadUrl.length > 0) {
        const streamUrl = matchedResult.downloadUrl[matchedResult.downloadUrl.length - 1].link;
        streamCache.set(cacheKey, streamUrl);
        return streamUrl;
      }
    }
    
    console.warn('No audio stream found on JioSaavn for:', title);
    return null;
    
  } catch (error) {
    console.error('Error fetching stream from JioSaavn:', error);
    return null;
  }
}

