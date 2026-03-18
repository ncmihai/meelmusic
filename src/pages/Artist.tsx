import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { searchArtists, searchAlbums, getArtistTopTracks } from '../services/spotifyService';
import { usePlayerStore } from '../stores/playerStore';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, Disc, ArrowLeft, BadgeCheck, User } from 'lucide-react';
import type { Song } from '../types';

export default function Artist() {
  const { id } = useParams<{ id: string }>();
  const artistName = decodeURIComponent(id || '');
  
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { play, currentSong, setQueue } = usePlayerStore();

  useEffect(() => {
    if (!artistName) return;

    const fetchArtistData = async () => {
      setIsLoading(true);
      try {
        // 1. Resolve true Spotify Artist ID from name
        const artists = await searchArtists(artistName, 1);
        if (artists.length === 0) {
          setTopSongs([]);
          setAlbums([]);
          setArtistInfo(null); // Clear artist info if not found
          return;
        }

        const realArtist = artists[0];
        setArtistInfo(realArtist);

        // 2. Fetch Top Songs & Albums precisely by ID
        const [songsRes, albumsRes] = await Promise.all([
          getArtistTopTracks(realArtist.id),
          searchAlbums(realArtist.id, 10)
        ]);

        setTopSongs(songsRes);
        setAlbums(albumsRes);
      } catch (err) {
        console.error("Artist profile failed:", err);
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
        <div className="w-12 h-12 border-4 border-[#9b4dca] border-t-transparent rounded-full animate-spin mb-4" />
        <p>Se încarcă artistul...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8 pt-8">
        <div className="w-48 h-48 md:w-56 md:h-56 shrink-0 shadow-2xl rounded-full overflow-hidden bg-[#282828] border-4 border-[#121212]">
          {artistInfo?.cover_url ? (
            <img src={artistInfo.cover_url} alt={artistName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#a7a7a7]">
              <User size={64} className="mb-2" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2 mb-2 text-sm font-bold text-white bg-[#1db954]/20 px-3 py-1 rounded-full w-max mx-auto md:mx-0">
            <BadgeCheck size={16} className="text-[#1db954]" />
            <span className="text-[#1db954]">PROFIL VERIFICAT</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
            {artistInfo?.name || artistName}
          </h1>
          <p className="text-[#a7a7a7]">{topSongs.length} Melodii Populare</p>
        </div>
      </div>

      <div className="p-6">
        {/* Action Row */}
        <div className="flex items-center gap-6 mb-10">
          <button 
            onClick={handlePlayAll}
            className="w-16 h-16 bg-[#9b4dca] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#aa6add] transition-transform shadow-[0_8px_24px_rgba(29,185,84,0.4)]"
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
                        <div className="w-4 h-4 text-[#9b4dca] flex items-center justify-center">
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
                        <span className={`font-medium truncate ${isPlaying ? 'text-[#9b4dca]' : 'text-white'}`}>{song.title}</span>
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
