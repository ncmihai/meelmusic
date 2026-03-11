import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../stores/playerStore';
import { searchSpotifySongs } from '../services/spotifyService';

// ========================================
// Home Page — Temporary Dev UI for Audio Testing
// Task 5 - Audio Engine
// ========================================

export default function Home() {
  const { user, signOut } = useAuth();
  
  // Audio Player State (only need the 'play' function to start a song)
  const { play } = usePlayerStore();
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const tracks = await searchSpotifySongs(query, 5);
      setResults(tracks);
    } catch (err) {
      console.error(err);
      alert('Error searching Spotify. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">🏠 Home (Dev Audio Test)</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <button
              onClick={signOut}
              className="rounded-lg bg-white/5 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
            >
              Logout
            </button>
          </div>
        ) : (
          <span className="text-sm text-text-secondary border border-white/10 rounded-full px-3 py-1">Mode: Guest</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: Search & Results */}
        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
          <h2 className="text-xl font-semibold mb-4 text-white">1. Search Spotify</h2>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g. The Weeknd Blinding Lights"
              className="flex-1 rounded-lg border border-white/10 bg-bg-surface px-4 py-2 text-text-primary outline-none focus:border-primary"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </form>

          <div className="space-y-3">
            {results.map((track) => (
              <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl bg-bg-surface hover:bg-white/5 transition group">
                <img src={track.cover_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{track.title}</p>
                  <p className="text-sm text-text-secondary truncate">{track.artist}</p>
                </div>
                <button 
                  onClick={() => play(track)}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:text-white transition-colors"
                  title="Play"
                >
                  ▶
                </button>
              </div>
            ))}
            {results.length === 0 && !loading && <p className="text-text-secondary text-sm">No results yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
