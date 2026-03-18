import { useParams, useNavigate } from 'react-router-dom';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, ListMusic, ArrowLeft, Trash2 } from 'lucide-react';

export default function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, removeSongFromPlaylist } = useLibraryStore();
  const { play, setQueue, currentSong } = usePlayerStore();

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#a7a7a7]">
        <p>Playlistul nu a fost găsit.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-white hover:underline">
          Înapoi
        </button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      setQueue(playlist.songs);
      play(playlist.songs[0]);
    }
  };

  const coverUrl = playlist.songs.length > 0 ? playlist.songs[0].cover_url : null;

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header / Hero */}
      <div className="relative w-full h-64 md:h-80 bg-gradient-to-b from-[#404040] to-[#121212] flex items-end p-8 shadow-xl shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-end gap-6 relative z-10 w-full">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-32 h-32 md:w-48 md:h-48 shadow-2xl rounded-md object-cover" />
          ) : (
            <div className="w-32 h-32 md:w-48 md:h-48 bg-[#282828] shadow-2xl rounded-md flex items-center justify-center">
               <ListMusic size={64} className="text-[#a7a7a7]" />
            </div>
          )}
          
          <div className="flex flex-col mb-2">
            <span className="text-xs uppercase font-bold text-white mb-2">Playlist</span>
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-4 tracking-tighter truncate">
              {playlist.name}
            </h1>
            <p className="text-[#a7a7a7] text-sm font-medium">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'melodie' : 'melodii'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Action Row */}
        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={handlePlayAll}
            disabled={playlist.songs.length === 0}
            className="w-16 h-16 bg-[#9b4dca] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#aa6add] transition-transform shadow-[0_8px_24px_rgba(29,185,84,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Play fill="currentColor" size={32} className="ml-2" />
          </button>
        </div>

        {/* Songs List */}
        <div>
          {playlist.songs.length === 0 ? (
            <div className="text-center py-20 text-[#a7a7a7]">
              Adaugă melodii în acest playlist folosind butonul de "3 puncte".
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_40px_80px] text-[#a7a7a7] text-sm border-b border-[#282828] pb-2 mb-4 px-2">
                <span className="text-center">#</span>
                <span>Titlu</span>
                <span></span>
                <span className="text-right flex items-center justify-end"><ClockIcon /></span>
              </div>

              {playlist.songs.map((song, index) => {
                const isPlaying = currentSong?.id === song.id;
                return (
                  <div 
                    key={song.id} 
                    onClick={() => {
                        setQueue(playlist.songs);
                        play(song);
                    }}
                    className="grid grid-cols-[40px_1fr_40px_80px] items-center p-2 rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
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
                      <img src={song.cover_url} alt={song.title} className="w-10 h-10 object-cover rounded shadow-sm shrink-0" />
                      <div className="flex flex-col truncate pr-4">
                        <span className={`font-medium truncate ${isPlaying ? 'text-[#9b4dca]' : 'text-white'}`}>{song.title}</span>
                        <div className="text-xs text-[#a7a7a7] truncate">
                          <ArtistList artists={song.artist} />
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div onClick={e => e.stopPropagation()}>
                        <ContextMenu song={song} />
                      </div>
                    </div>

                    <div className="text-sm text-[#a7a7a7] text-right flex items-center justify-end gap-2 pr-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSongFromPlaylist(playlist.id, song.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-2"
                        title="Șterge din Playlist"
                      >
                         <Trash2 size={16} />
                      </button>
                      <span className="w-10 text-right">
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
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg role="img" height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
      <path d="M8 3.25a.75.75 0 0 1 .75.75v3.25H11a.75.75 0 0 1 0 1.5H7.25V4A.75.75 0 0 1 8 3.25z"></path>
    </svg>
  );
}
