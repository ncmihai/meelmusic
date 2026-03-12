import { useState, useEffect } from 'react';
import { Search as SearchIcon, Play } from 'lucide-react';
import { searchSpotifySongs, getGenreRecommendations } from '../services/spotifyService';
import { usePlayerStore } from '../stores/playerStore';
import { useDebounce } from '../hooks/useDebounce';
import type { Song } from '../types';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  const { play } = usePlayerStore();

  // 1. Search As You Type Logic (Debounced)
  const debouncedQuery = useDebounce(query, 300); // Wait 300ms after user stops typing

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const tracks = await searchSpotifySongs(debouncedQuery, 20);
        setResults(tracks);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // 2. Fetch Initial Recommendations (Empty State)
  useEffect(() => {
    const loadRecommendations = async () => {
      setIsLoadingRecs(true);
      try {
        const recs = await getGenreRecommendations();
        setRecommendations(recs);
      } catch (err) {
        console.error("Recommendations error:", err);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    loadRecommendations();
  }, []);

  // UI Helper: Render a grid of song cards
  const renderGrid = (songs: Song[], title: string, isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-[#181818] p-4 rounded-xl animate-pulse">
                <div className="w-full aspect-square bg-[#282828] rounded-md mb-4 shadow-lg" />
                <div className="h-4 bg-[#282828] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#282828] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (songs.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {songs.map(song => (
            <div 
              key={song.id} 
              className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-colors group relative cursor-pointer"
              onClick={() => play(song)}
            >
              <div className="relative mb-4">
                <img 
                  src={song.cover_url} 
                  alt={song.title} 
                  className="w-full aspect-square object-cover rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)]" 
                />
                <button 
                  className="absolute bottom-2 right-2 w-12 h-12 flex justify-center items-center bg-[#1db954] text-black rounded-full shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-[#1ed760]"
                  onClick={(e) => {
                    e.stopPropagation(); // Don't trigger the parent onClick twice
                    play(song);
                  }}
                >
                  <Play size={24} className="fill-current ml-1" />
                </button>
              </div>
              <h3 className="text-white font-bold truncate mb-1">{song.title}</h3>
              <p className="text-[#a7a7a7] text-sm truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-transparent pb-6 backdrop-blur-md">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="text-black" size={20} />
          </div>
          <input
            type="text"
            className="w-full bg-white text-black text-sm rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white border-none placeholder-gray-500 font-medium"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 mt-2">
        {query.trim() === '' ? (
          // Empty State: Recommendations
          renderGrid(recommendations, "Made for you", isLoadingRecs)
        ) : (
          // Active Search State
          renderGrid(results, "Top Results", isSearching)
        )}
      </div>

    </div>
  );
}
