import { useState, useEffect } from 'react';
import { Play, User as UserIcon } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSpotifySongs, getGenreRecommendations, searchArtists } from '../services/spotifyService';
import { usePlayerStore } from '../stores/playerStore';
import { useDebounce } from '../hooks/useDebounce';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import type { Song } from '../types';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<Song[]>([]);
  const [topArtist, setTopArtist] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  const { play } = usePlayerStore();

  // 1. Search As You Type Logic (Debounced)
  const debouncedQuery = useDebounce(query, 300); // Wait 300ms after user stops typing

  useEffect(() => {
    if (debouncedQuery.trim() === '') {
      setResults([]);
      setTopArtist(null); // Clear top artist when query is empty
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const [songsRes, artistsRes] = await Promise.all([
          searchSpotifySongs(debouncedQuery, 15),
          searchArtists(debouncedQuery, 3)
        ]);
        
        setResults(songsRes);
        
        // Exact strict match on artist search or rely on API confidence
        // JioSaavn usually returns the most relevant artist first.
        if (artistsRes.length > 0) {
          // If the first result's name roughly matches the query
          const firstArtist = artistsRes[0];
          if (firstArtist.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
              debouncedQuery.toLowerCase().includes(firstArtist.name.toLowerCase())) {
            setTopArtist(firstArtist);
          } else {
            setTopArtist(null);
          }
        } else {
          setTopArtist(null);
        }

      } catch (err) {
        console.error('Search error:', err);
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
              <div className="flex justify-between items-start">
                <div className="overflow-hidden flex-1 pr-2">
                  <h3 className="text-white font-bold truncate mb-1">{song.title}</h3>
                  <div className="text-[#a7a7a7] text-sm truncate">
                    <ArtistList artists={song.artist} />
                  </div>
                </div>
                <div onClick={e => e.stopPropagation()} className="shrink-0 -mr-2 -mt-1 hidden sm:block">
                   <ContextMenu song={song} />
                </div>
              </div>
              {/* Visible on mobile without hover */}
              <div onClick={e => e.stopPropagation()} className="absolute top-2 right-2 bg-black/40 rounded-full sm:hidden backdrop-blur-md">
                <ContextMenu song={song} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Main Content Area */}
      <div className="flex-1 mt-2">
        {query.trim() === '' ? (
          // Empty State: Recommendations
          renderGrid(recommendations, "Made for you", isLoadingRecs)
        ) : (
          // Active Search State
          <div className="flex flex-col gap-8">
            {/* 1. TOP RESULT CARD (Artist Focus) */}
            {topArtist && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-6">Rezultat Principal</h2>
                <div 
                  onClick={() => navigate(`/artist/${encodeURIComponent(topArtist.name)}`)}
                  className="bg-[#181818] hover:bg-[#282828] transition-colors p-6 rounded-xl flex flex-col md:flex-row gap-6 max-w-2xl cursor-pointer group relative shadow-xl hover:shadow-2xl"
                >
                  {topArtist.cover_url ? (
                    <img src={topArtist.cover_url} alt={topArtist.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-2xl shrink-0" />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#3e3e3e] flex items-center justify-center shrink-0">
                      <UserIcon size={48} className="text-[#a7a7a7]" />
                    </div>
                  )}
                  
                  <div className="flex flex-col justify-center flex-1">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 truncate group-hover:underline">
                      {topArtist.name}
                    </h1>
                    <span className="bg-[#121212] px-3 py-1 rounded-full text-sm font-bold w-max uppercase tracking-wider text-[#a7a7a7]">
                      Artist
                    </span>
                  </div>

                  {/* Optional big play button if we want to play their radios, for now just navigation */}
                </div>
              </div>
            )}

            {/* 2. SONGS RESULTS */}
            {renderGrid(results, "Piese", isSearching)}
          </div>
        )}
      </div>
    </div>
  );
}
