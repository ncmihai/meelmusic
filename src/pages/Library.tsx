import { useState } from 'react';
import { useLibraryStore } from '../stores/libraryStore';
import { useModalStore } from '../stores/modalStore';
import { usePlayerStore } from '../stores/playerStore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ContextMenu from '../components/ContextMenu';
import ArtistList from '../components/ArtistList';
import { Play, Plus, Music, Heart } from 'lucide-react';

export default function Library() {
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked'>('playlists');
  const { playlists, likedSongs } = useLibraryStore();
  const { openCreatePlaylist } = useModalStore();
  const { play, setQueue, currentSong } = usePlayerStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreatePlaylist = () => {
    if (!user) {
      if (confirm('Trebuie să fii autentificat pentru a crea un playlist. Vrei să te loghezi?')) {
        navigate('/login');
      }
      return;
    }
    openCreatePlaylist();
  };

  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs);
      play(likedSongs[0]);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto w-full max-w-7xl mx-auto pb-24">
      <div className="flex items-center gap-6 mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white">Biblioteca Ta</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('playlists')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'playlists' ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'
          }`}
        >
          Playlisturi
        </button>
        <button 
          onClick={() => setActiveTab('liked')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
            activeTab === 'liked' ? 'bg-white text-black' : 'bg-[#282828] text-white hover:bg-[#3E3E3E]'
          }`}
        >
          Melodii Apreciate
        </button>
      </div>

      {/* Content */}
      {activeTab === 'playlists' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Create Button Card */}
          <div 
            onClick={handleCreatePlaylist}
            className="bg-[#181818] p-4 rounded-xl cursor-pointer hover:bg-[#282828] transition-colors group flex flex-col items-center justify-center min-h-[220px]"
          >
            <div className="w-16 h-16 rounded-full bg-[#282828] group-hover:bg-[#3E3E3E] flex items-center justify-center mb-4 transition-colors">
              <Plus size={32} className="text-white" />
            </div>
            <h3 className="text-white font-bold text-lg">Creare Playlist</h3>
          </div>

          {/* Playlist Cards */}
          {playlists.map((playlist) => {
            // Get up to 4 covers for the grid
            const covers = playlist.songs.slice(0, 4).map(s => s.cover_url).filter(Boolean);
            
            return (
              <div 
                key={playlist.id} 
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-colors flex flex-col group cursor-pointer"
              >
                <div className="relative mb-4 pb-[100%] rounded-md bg-gradient-to-br from-[#1db954] to-[#121212] overflow-hidden shadow-lg">
                  {covers.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Music size={48} className="text-[#b3b3b3]" />
                    </div>
                  ) : covers.length < 4 ? (
                    <img src={covers[0]} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <div className="grid grid-cols-2 w-full h-full gap-0.5 bg-black">
                      {covers.map((url, i) => (
                        <img key={i} src={url} className="w-full h-full object-cover" alt={`Cover ${i+1}`} />
                      ))}
                    </div>
                  )}
                </div>
                
                <h3 className="text-white font-bold mb-1 truncate">{playlist.name}</h3>
                <p className="text-sm text-[#a7a7a7]">{playlist.songs.length} melodii</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Liked Songs Header */}
          <div className="flex items-end gap-6 mb-6">
            <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-purple-800 rounded-xl shadow-2xl flex items-center justify-center shrink-0">
              <Heart size={64} fill="currentColor" stroke="none" className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wider mb-2">Playlist</p>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">Melodii Apreciate</h1>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{likedSongs.length} melodii</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          {likedSongs.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={handlePlayLikedSongs}
                className="w-14 h-14 bg-[#1db954] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#1ed760] transition-transform"
              >
                <Play fill="currentColor" size={28} className="ml-1" />
              </button>
            </div>
          )}

          {/* Liked Songs List */}
          {likedSongs.length === 0 ? (
            <div className="text-center py-20 text-[#a7a7a7]">
              Nu ai adăugat încă melodii la favorite.
            </div>
          ) : (
            <div className="flex flex-col w-full">
              {/* Table Header */}
              <div className="grid grid-cols-[40px_1fr_minmax(120px,200px)_80px] text-sm text-[#a7a7a7] border-b border-[#282828] pb-2 mb-4 px-4">
                <div>#</div>
                <div>Titlu</div>
                <div className="hidden md:block">Album</div>
                <div className="text-right">Durată</div>
              </div>

              {likedSongs.map((song, index) => {
                const isPlaying = currentSong?.id === song.id;
                
                return (
                  <div 
                    key={song.id} 
                    onClick={() => {
                        setQueue(likedSongs);
                        play(song);
                    }}
                    className="grid grid-cols-[40px_1fr_minmax(120px,200px)_80px] items-center p-2 px-4 rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer group"
                  >
                    <div className="text-[#a7a7a7] flex items-center justify-center w-6">
                      {isPlaying ? (
                         <div className="w-4 h-4 text-[#1db954] flex items-center justify-center">
                           <Music size={14} className="animate-pulse" />
                         </div>
                      ) : (
                        <span className="group-hover:hidden">{index + 1}</span>
                      )}
                      {!isPlaying && <Play fill="currentColor" size={14} className="hidden group-hover:block text-white" />}
                    </div>
                    
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={song.cover_url} alt={song.title} className="w-10 h-10 object-cover rounded" />
                      <div className="flex flex-col truncate pr-4">
                        <span className={`truncate ${isPlaying ? 'text-[#1db954]' : 'text-white'}`}>{song.title}</span>
                        <div className="text-sm text-[#a7a7a7] truncate">
                           <ArtistList artists={song.artist} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-sm text-[#a7a7a7] truncate pr-4">
                      {song.album || 'Unknown Album'}
                    </div>
                    
                    <div className="flex items-center justify-end gap-4 text-sm text-[#a7a7a7] pr-2">
                       <span>
                         {Math.floor(song.duration_ms / 60000)}:
                         {Math.floor((song.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                       </span>
                       <div onClick={e => e.stopPropagation()}>
                         <ContextMenu song={song} />
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
