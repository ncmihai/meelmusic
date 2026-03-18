import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlbumDetails } from '../services/spotifyService';
import { usePlayerStore } from '../stores/playerStore';
import { useLibraryStore } from '../stores/libraryStore';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, ArrowLeft, Disc, Plus } from 'lucide-react';
import type { Song } from '../types';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { play, setQueue, currentSong } = usePlayerStore();
  const { createPlaylist, addSongToPlaylist } = useLibraryStore();
  
  const [albumInfo, setAlbumInfo] = useState<any>(null);
  const [albumTracks, setAlbumTracks] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const details = await getAlbumDetails(id);
        if (details) {
          setAlbumInfo(details.albumInfo);
          setAlbumTracks(details.tracks);
        }
      } catch (err) {
        console.error("Failed to load album:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbum();
  }, [id]);

  const handlePlayAlbum = () => {
    if (albumTracks.length > 0) {
      setQueue(albumTracks);
      play(albumTracks[0]);
    }
  };

  const handleSaveToLibrary = () => {
    if (!albumInfo || albumTracks.length === 0) return;
    
    // Create a new playlist acting as the saved Album
    const newPlaylistId = createPlaylist(albumInfo.name, albumInfo.cover_url);
    
    // Add all tracks to this new library playlist
    albumTracks.forEach((track) => {
      addSongToPlaylist(newPlaylistId, track);
    });
    
    setIsSaved(true);
    // Automatically revert the button text after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center text-[#a7a7a7]">
        <div className="w-12 h-12 border-4 border-[#9b4dca] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!albumInfo || albumTracks.length === 0) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-[#a7a7a7]">
        <Disc size={64} className="mb-4 text-[#a7a7a7]/50" />
        <h2 className="text-2xl font-bold text-white mb-2">Album Indisponibil</h2>
        <p>Acest album nu a putut fi încărcat de pe serverele Spotify.</p>
        <button 
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
        >
          Înapoi
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="relative w-full bg-[#1e1e1e] flex flex-col md:flex-row items-center md:items-end p-8 gap-6 shadow-2xl">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-black to-transparent" />
        
        <div className="relative z-10 w-48 h-48 md:w-56 md:h-56 shrink-0 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden bg-[#282828] mx-auto md:mx-0 mt-12 md:mt-0">
          {albumInfo.cover_url ? (
            <img src={albumInfo.cover_url} alt={albumInfo.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#a7a7a7]">
              <Disc size={64} />
            </div>
          )}
        </div>
        
        <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
          <p className="text-sm font-bold text-white uppercase tracking-wider mb-2">
            Album
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white mb-4 tracking-tighter line-clamp-2">
            {albumInfo.name}
          </h1>
          <div className="flex items-center gap-2 text-[#a7a7a7] text-sm font-medium">
            <span className="text-white font-bold">{albumInfo.artist}</span>
            <span>•</span>
            <span>{albumInfo.release_date?.split('-')[0] || ''}</span>
            <span>•</span>
            <span>{albumInfo.total_tracks} piese</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 md:p-8 flex items-center gap-6 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={handlePlayAlbum}
          className="w-14 h-14 bg-[#9b4dca] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#aa6add] transition-all shadow-xl"
        >
          <Play fill="currentColor" size={28} className="translate-x-[2px]" />
        </button>
        
        <button
          onClick={handleSaveToLibrary}
          disabled={isSaved}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all border ${
            isSaved 
              ? 'bg-[#1db954] text-black border-[#1db954]' 
              : 'bg-transparent text-white border-[#878787] hover:border-white hover:scale-105'
          }`}
        >
          {isSaved ? (
            <span>Salvat în Librărie ✓</span>
          ) : (
            <>
              <Plus size={20} />
              <span>Adaugă la Playlisturi</span>
            </>
          )}
        </button>
      </div>

      {/* Tracks Container */}
      <div className="px-6 md:px-8 pb-32">
        <div className="grid grid-cols-[16px_minmax(0,1fr)_auto_auto] gap-4 text-[#a7a7a7] border-b border-[#282828] pb-2 mb-4 text-sm font-medium px-4">
          <div className="text-center">#</div>
          <div>Titlu</div>
          <div className="hidden sm:block">Apariție</div>
          <div className="w-12 text-center">⏱</div>
        </div>

        <div className="flex flex-col gap-1">
          {albumTracks.map((song, index) => {
            const isPlaying = currentSong?.id === song.id;
            
            return (
              <div 
                key={song.id}
                onClick={() => {
                  setQueue(albumTracks);
                  play(song);
                }}
                className={`grid grid-cols-[16px_minmax(0,1fr)_auto_auto] sm:grid-cols-[16px_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-center p-3 rounded-md hover:bg-[#2a2a2a] group cursor-pointer transition-colors ${isPlaying ? 'bg-[#2a2a2a]' : ''}`}
              >
                <div className="text-center w-4 text-base relative">
                  <span className={`group-hover:opacity-0 ${isPlaying ? 'text-[#9b4dca] opacity-100 font-bold' : 'opacity-100'}`}>
                    {index + 1}
                  </span>
                  <Play size={16} fill="currentColor" className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-white`} />
                </div>
                
                <div className="flex items-center gap-3 overflow-hidden pr-4">
                  <div className="flex flex-col overflow-hidden">
                    <span className={`truncate text-base ${isPlaying ? 'text-[#9b4dca] font-bold' : 'text-white'}`}>
                      {song.title}
                    </span>
                    <span className="truncate text-sm text-[#a7a7a7] group-hover:text-white transition-colors">
                      <ArtistList artists={song.artist} />
                    </span>
                  </div>
                </div>

                {/* Optional Album column inside generic table */}
                <div className="hidden sm:flex items-center text-sm text-[#a7a7a7] truncate pr-4">
                  {albumInfo.name}
                </div>

                <div className="flex items-center gap-4 text-sm text-[#a7a7a7]">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                    <ContextMenu song={song} />
                  </div>
                  
                  <span className="w-10 text-right">
                    {song.duration_ms 
                      ? `${Math.floor(song.duration_ms / 60000)}:${((song.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`
                      : '--:--'}
                  </span>
                  
                  <div className="sm:hidden -mr-2">
                    <ContextMenu song={song} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
