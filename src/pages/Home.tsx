import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStore } from '../stores/playerStore';
import { searchSpotifySongs, getPopularSongs } from '../services/spotifyService';
import { useLibraryStore } from '../stores/libraryStore';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, ListMusic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../types';

export default function Home() {
  const { user } = useAuth();
  const { play, setQueue, currentSong, history } = usePlayerStore();
  const { playlists } = useLibraryStore();
  const navigate = useNavigate();
  
  const [trending, setTrending] = useState<Song[]>([]);
  const [historyRecs, setHistoryRecs] = useState<{ artist: string, songs: Song[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Extract up to 6 unique recently played artists from history
  const recentSongs = [...history].reverse().slice(0, 8); // Top 8 most recent
  const uniqueArtists = Array.from(new Set(recentSongs.map(s => s.artist.split(',')[0].trim())));

  useEffect(() => {
    const fetchHomeContent = async () => {
      setLoading(true);
      try {
        // Fetch global popular data
        const trend = await getPopularSongs();
        setTrending(trend.slice(0, 6));

        // If user has history, fetch recommendations based on their most recent artist
        if (uniqueArtists.length > 0) {
          const topArtist = uniqueArtists[0]; // Most recent artist
          const recs = await searchSpotifySongs(topArtist, 10);
          
          // Filter out exactly what they just played to show new stuff from that artist
          const historyIds = new Set(recentSongs.map(s => s.id));
          const filteredRecs = recs.filter((r: Song) => !historyIds.has(r.id)).slice(0, 6);
          
          if (filteredRecs.length > 0) {
            setHistoryRecs({ artist: topArtist, songs: filteredRecs });
          }
        }
      } catch (err) {
        console.error("Home fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, [history.length]); // Refresh if history changes significantly

  const renderGrid = (songs: Song[], title: string) => {
    if (songs.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {songs.map((song) => {
            const isPlaying = currentSong?.id === song.id;
            return (
              <div 
                key={song.id}
                onClick={() => {
                  setQueue(songs);
                  play(song);
                }}
                className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer relative shadow-lg hover:shadow-xl"
              >
                <div className="relative mb-4">
                  <img src={song.cover_url} alt={song.title} className="w-full aspect-square object-cover rounded-md shadow-md" />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setQueue(songs);
                      play(song);
                    }}
                    className={`absolute bottom-2 right-2 w-12 h-12 bg-[#1db954] rounded-full flex items-center justify-center text-black shadow-xl transition-all duration-300 ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 hover:bg-[#1ed760]'}`}
                  >
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </button>
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden flex-1 pr-2">
                    <h3 className={`font-bold truncate mb-1 ${isPlaying ? 'text-[#1db954]' : 'text-white'}`}>{song.title}</h3>
                    <div className="text-[#a7a7a7] text-sm truncate">
                      <ArtistList artists={song.artist} />
                    </div>
                  </div>
                  <div onClick={e => e.stopPropagation()} className="shrink-0 -mr-2 -mt-1 hidden sm:block">
                     <ContextMenu song={song} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#a7a7a7]">
        <div className="w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Se încarcă recomandările...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto w-full">
      {/* Greeting Header */}
      <h1 className="text-3xl font-extrabold text-white mb-8 mt-2">
        {user ? `Salutare, ${user.user_metadata?.full_name?.split(' ')[0] || 'prietene'}!` : 'Bun venit'}
      </h1>

      {/* 0. My Playlists (Top Priority) */}
      {playlists.length > 0 && (
         <div className="mb-10">
           <h2 className="text-2xl font-bold text-white mb-6">Playlisturile Tale</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {playlists.map((pl) => (
                <div 
                  key={pl.id}
                  onClick={() => navigate('/library')}
                  className="bg-[#2a2a2a] hover:bg-[#3e3e3e] flex items-center gap-4 rounded-md overflow-hidden cursor-pointer transition-colors pr-4 group shadow-md"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1db954] to-[#121212] shrink-0 flex items-center justify-center shadow-sm">
                    <ListMusic size={24} className="text-black" />
                  </div>
                  <div className="flex-1 truncate py-2 flex items-center justify-between">
                     <span className="text-white font-bold text-base truncate">{pl.name}</span>
                     <button className="opacity-0 group-hover:opacity-100 text-[#1db954] transition-opacity bg-black/40 rounded-full p-2 ml-2 hover:scale-110">
                        <Play fill="currentColor" size={16} />
                     </button>
                  </div>
                </div>
             ))}
           </div>
         </div>
      )}

      {/* 1. Recently Played directly from History */}
      {recentSongs.length > 0 && (
         <div className="mb-10">
           <h2 className="text-2xl font-bold text-white mb-6">Ascultate Recent</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
             {recentSongs.slice(0, 6).map((song) => (
                <div 
                  key={song.id}
                  onClick={() => {
                     setQueue(recentSongs);
                     play(song);
                  }}
                  className="bg-[#2a2a2a] hover:bg-[#3e3e3e] flex items-center gap-3 rounded-md overflow-hidden cursor-pointer transition-colors pr-4 group shadow-md"
                >
                  <img src={song.cover_url} alt={song.title} className="w-14 h-14 object-cover shrink-0 shadow-sm" />
                  <div className="flex-1 truncate py-2 flex items-center justify-between">
                     <div className="flex flex-col truncate pr-2">
                        <span className="text-white font-bold text-sm truncate">{song.title}</span>
                        <span className="text-[#a7a7a7] text-xs truncate">{song.artist}</span>
                     </div>
                     <button className="opacity-0 group-hover:opacity-100 text-[#1db954] transition-opacity bg-black/40 rounded-full p-1.5 ml-2 hover:scale-110">
                        <Play fill="currentColor" size={14} />
                     </button>
                  </div>
                </div>
             ))}
           </div>
         </div>
      )}

      {/* 2. History Based Recommendations */}
      {historyRecs && renderGrid(historyRecs.songs, `Din artiștii ascultați: ${historyRecs.artist}`)}

      {/* 3. Trending / Global Recommendations */}
      {renderGrid(trending, "Recomandări Globale")}
      
    </div>
  );
}
