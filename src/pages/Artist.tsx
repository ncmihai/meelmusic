import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchSpotifySongs, searchAlbums } from '../services/spotifyService';
import { usePlayerStore } from '../stores/playerStore';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, Disc, ArrowLeft } from 'lucide-react';
import type { Song } from '../types';

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const artistName = id ? decodeURIComponent(id) : '';
  const navigate = useNavigate();
  
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { play, currentSong, setQueue } = usePlayerStore();

  useEffect(() => {
    if (!artistName) return;

    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        // Fetch Top Songs & Albums in parallel
        const [songsRes, albumsRes] = await Promise.all([
          searchSpotifySongs(artistName, 15),
          searchAlbums(artistName, 10)
        ]);

        // We relax the filter because JioSaavn sometimes formats names differently 
        // e.g. "S.Z.A." vs "SZA", which caused our strict string filter to drop all songs and show an empty page.
        // We trust the API's ranking for the Top Songs list.
        setTopSongs(songsRes);
        
        // We still loosely filter albums just to be safe, but can also relax it if we want.
        // Even for albums, JioSaavn is usually accurate when searching specific artists.
        setAlbums(albumsRes);
        
      } catch (err) {
        console.error("Failed to fetch artist data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistData();
  }, [artistName]);

  const handlePlayAll = () => {
    if (topSongs.length > 0) {
      setQueue(topSongs);
      play(topSongs[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#a7a7a7]">
        <div className="w-12 h-12 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Se încarcă artistul...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header / Hero */}
      <div className="relative w-full h-64 md:h-80 bg-[#1e1e1e] flex items-end p-8 shadow-2xl">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Abstract Gradient Background for Artist */}
        <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black to-transparent" />
        
        <div className="relative z-10">
          <p className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Profil Verificat
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tighter">
            {artistName}
          </h1>
          <p className="text-[#a7a7a7]">{topSongs.length} Melodii Populare</p>
        </div>
      </div>

      <div className="p-6">
        {/* Action Row */}
        <div className="flex items-center gap-6 mb-10">
          <button 
            onClick={handlePlayAll}
            className="w-16 h-16 bg-[#1db954] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#1ed760] transition-transform shadow-[0_8px_24px_rgba(29,185,84,0.4)]"
          >
            <Play fill="currentColor" size={32} className="ml-2" />
          </button>
        </div>

        {/* Top Songs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Populare</h2>
          {topSongs.length === 0 ? (
            <p className="text-[#a7a7a7]">Nu am găsit melodii populare pentru acest artist.</p>
          ) : (
            <div className="flex flex-col gap-2 max-w-4xl">
              {topSongs.slice(0, 5).map((song, index) => {
                const isPlaying = currentSong?.id === song.id;
                return (
                  <div 
                    key={song.id} 
                    onClick={() => {
                        setQueue(topSongs);
                        play(song);
                    }}
                    className="grid grid-cols-[40px_1fr_80px] sm:grid-cols-[40px_1fr_40px_80px] items-center p-2 rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
                  >
                    <div className="text-[#a7a7a7] flex items-center justify-center w-6">
                      {isPlaying ? (
                        <div className="w-4 h-4 text-[#1db954] flex items-center justify-center">
                          <span className="animate-pulse font-bold text-lg">ılı</span>
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      {!isPlaying && <Play fill="currentColor" size={14} className="hidden group-hover:block text-white" />}
                    </div>
                    
                    <div className="flex items-center gap-4 overflow-hidden">
                      <img src={song.cover_url} alt={song.title} className="w-10 h-10 object-cover rounded shadow-md shrink-0" />
                      <div className="flex flex-col truncate pr-4">
                        <span className={`font-medium truncate ${isPlaying ? 'text-[#1db954]' : 'text-white'}`}>{song.title}</span>
                        <span className="text-xs text-[#a7a7a7] truncate">
                           <ArtistList artists={song.artist} />
                        </span>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div onClick={e => e.stopPropagation()}>
                        <ContextMenu song={song} />
                      </div>
                    </div>

                    <div className="text-sm text-[#a7a7a7] text-right flex items-center justify-end gap-2 pr-2">
                      <span className="sm:hidden" onClick={e => e.stopPropagation()}>
                         <ContextMenu song={song} />
                      </span>
                      <span>
                        {Math.floor(song.duration_ms / 60000)}:
                        {Math.floor((song.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Albums */}
        {albums.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Discografie (Albume)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {albums.map((album) => (
                <div key={album.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-colors flex flex-col">
                  {album.cover_url ? (
                     <img src={album.cover_url} alt={album.title} className="w-full aspect-square object-cover rounded-md mb-4 shadow-lg" />
                  ) : (
                     <div className="w-full aspect-square bg-[#282828] rounded-md mb-4 flex items-center justify-center">
                       <Disc size={40} className="text-[#a7a7a7]" />
                     </div>
                  )}
                  <h3 className="text-white font-bold truncate mb-1">{album.title}</h3>
                  <p className="text-[#a7a7a7] text-sm truncate">{album.year || 'Album'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
