import { usePlayerStore } from '../stores/playerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Heart } from 'lucide-react';

export default function PlayerBar() {
  const { currentSong, isPlaying, volume, progress, duration, togglePlay, next, setVolume, seek } = usePlayerStore();

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentProgress = (progress / (duration || 1)) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50">
      
      {/* Left: Song Info */}
      <div className="w-[30%] flex items-center gap-4">
        {currentSong ? (
          <>
            <img 
              src={currentSong.cover_url} 
              alt={currentSong.title} 
              className="w-14 h-14 rounded shadow-lg object-cover"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-white text-sm font-medium hover:underline cursor-pointer truncate">
                {currentSong.title}
              </span>
              <span className="text-xs text-[#b3b3b3] hover:underline hover:text-white cursor-pointer truncate">
                {currentSong.artist}
              </span>
            </div>
            <button className="ml-4 text-[#b3b3b3] hover:text-white">
              <Heart size={16} /> {/* Placeholder for actual Like component later */}
            </button>
          </>
        ) : (
          <div className="text-sm text-[#b3b3b3]">No track selected</div>
        )}
      </div>

      {/* Center: Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl px-4">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-[#b3b3b3] hover:text-white disabled:opacity-50">
            <Shuffle size={20} />
          </button>
          <button 
            className="text-[#b3b3b3] hover:text-white disabled:opacity-50"
            disabled={!currentSong}
          >
            <SkipBack size={24} className="fill-current" />
          </button>
          <button 
            onClick={togglePlay}
            disabled={!currentSong}
            className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
          </button>
          <button 
            onClick={next}
            disabled={!currentSong}
            className="text-[#b3b3b3] hover:text-white disabled:opacity-50"
          >
            <SkipForward size={24} className="fill-current" />
          </button>
          <button className="text-[#b3b3b3] hover:text-white disabled:opacity-50">
            <Repeat size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 group">
          <span className="text-xs text-[#b3b3b3] w-10 text-right">{formatTime(progress)}</span>
          <div className="relative flex-1 h-3 flex items-center">
            <input 
              type="range" 
              min="0" 
              max={duration || 100}
              step="1"
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              disabled={!currentSong || duration === 0}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            {/* Custom track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-[#b3b3b3] w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume Controls */}
      <div className="w-[30%] flex items-center justify-end gap-3 min-w-[180px]">
        <button 
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="text-[#b3b3b3] hover:text-white"
        >
          {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <div className="w-24 h-3 flex items-center relative group">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
            <div 
              className="h-full bg-white group-hover:bg-[#1db954] rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
