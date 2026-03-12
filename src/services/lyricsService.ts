// ========================================
// Lyrics Service — Task 7.5.1
// Fetches time-synced lyrics from the public LRCLIB API.
// No API Key required.
// ========================================

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

/**
 * Fetches synced lyrics for a given track from LRCLIB
 */
export async function getSyncedLyrics(trackName: string, artistName: string, durationMs?: number): Promise<LyricLine[] | null> {
  try {
    let url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`;
    
    // If we have strict duration, LRCLIB can match it better
    // LRCLIB expects duration in seconds (integer)
    if (durationMs) {
      url += `&duration=${Math.floor(durationMs / 1000)}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) return null; // No lyrics found
        throw new Error(`LRCLIB error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data && data.syncedLyrics) {
      return parseLRC(data.syncedLyrics);
    }
    
    return null; // Only plain lyrics found, or no lyrics at all
  } catch (error) {
    console.error("Failed to fetch lyrics:", error);
    return null;
  }
}

/**
 * Parses LRC format string into an array of { time, text } objects
 * Example format: "[00:12.45] This is the first line"
 */
function parseLRC(lrcString: string): LyricLine[] {
  const lines = lrcString.split('\n');
  const parsedLines: LyricLine[] = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3], 10) * (match[3].length === 2 ? 10 : 1);
      
      const timeInSeconds = (minutes * 60) + seconds + (milliseconds / 1000);
      const text = line.replace(timeRegex, '').trim();
      
      // Even if text is empty (instrumental gap), we keep it for timing
      parsedLines.push({ time: timeInSeconds, text });
    }
  }

  return parsedLines;
}
