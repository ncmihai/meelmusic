import { usePlayerStore } from '../stores/playerStore';
import { Play, X, Music } from 'lucide-react';
import ArtistList from './ArtistList';
import type { Song } from '../types';

export default function QueuePanel() {
  const { currentSong, queue, showQueue, play, setQueue } = usePlayerStore();

  if (!showQueue) return null;

  const handleRemove = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    setQueue(queue.filter(s => s.id !== songId));
  };

  const handlePlay = (song: Song) => {
    play(song);
  };

  // Find the index of the current song to show what's "Next In Queue"
  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const nextSongs = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;

  return (
    <div className="w-[350px] bg-[#121212] flex flex-col h-full overflow-hidden transition-all duration-300 relative z-20 border-l border-[#282828]">
      <div className="p-6 pb-4 shrink-0 border-b border-[#282828]">
        <h2 className="text-xl font-bold text-white mb-1">Queue</h2>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-4 pb-24 scrollbar-hide">
        
        {/* Now Playing */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#a7a7a7] mb-3 px-2">Now Playing</h3>
          {currentSong ? (
            <div className="flex items-center gap-3 p-2 rounded-md bg-[#2a2a2a] group">
              <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Music size={16} className="text-[#1db954] animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="text-[#1db954] font-medium truncate">{currentSong.title}</span>
                <span className="text-xs text-[#a7a7a7] truncate">
                  <ArtistList artists={currentSong.artist} />
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#a7a7a7] px-2">Nu există o melodie curentă.</p>
          )}
        </div>

        {/* Next In Queue */}
        <div>
          <h3 className="text-sm font-bold text-[#a7a7a7] mb-3 px-2">Next In Queue</h3>
          {nextSongs.length === 0 ? (
            <p className="text-sm text-[#a7a7a7] px-2 text-center py-10">Nu ai adăugat melodii în Queue.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {nextSongs.map((song) => (
                <div 
                  key={song.id} 
                  onClick={() => handlePlay(song)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-[#2a2a2a] cursor-pointer group transition-colors"
                >
                  <div className="relative w-12 h-12 shrink-0 rounded overflow-hidden">
                    <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center">
                      <Play fill="currentColor" size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col truncate flex-1">
                    <span className="text-white font-medium truncate group-hover:underline">{song.title}</span>
                    <span className="text-xs text-[#a7a7a7] truncate">
                      <ArtistList artists={song.artist} />
                    </span>
                  </div>

                  <button 
                    onClick={(e) => handleRemove(e, song.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-[#a7a7a7] hover:text-white transition-opacity"
                    title="Remove from Queue"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
