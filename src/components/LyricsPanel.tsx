import { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { getSyncedLyrics, type LyricLine } from '../services/lyricsService';
import { Mic } from 'lucide-react';
import clsx from 'clsx';

export default function LyricsPanel() {
  const { currentSong, progress, showLyrics } = usePlayerStore();
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for auto-scrolling
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  // Fetch lyrics when song changes
  useEffect(() => {
    if (!currentSong || !showLyrics) return;

    const fetchLyrics = async () => {
      setIsLoading(true);
      const data = await getSyncedLyrics(currentSong.title, currentSong.artist, currentSong.duration_ms);
      setLyrics(data);
      setIsLoading(false);
    };

    fetchLyrics();
  }, [currentSong, showLyrics]);

  // Find the active line index based on current playback progress
  const getActiveLineIndex = () => {
    if (!lyrics || lyrics.length === 0) return -1;
    
    // Find the last line whose time is less than or equal to current progress
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (progress >= lyrics[i].time - 0.5) { // 0.5s offset for smoother UI feel
        return i;
      }
    }
    return -1;
  };

  const activeIndex = getActiveLineIndex();

  // Auto-scroll logic
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      // Smooth scroll the container so the active line is near the middle
      const containerInfo = containerRef.current.getBoundingClientRect();
      const activeLineInfo = activeLineRef.current.getBoundingClientRect();
      
      const scrollNeeded = (activeLineInfo.top - containerInfo.top) - (containerInfo.height / 2) + (activeLineInfo.height / 2);
      
      // Only scroll if it's significantly off-center to prevent jittering on every millisecond update
      if (Math.abs(scrollNeeded) > 50) {
        containerRef.current.scrollBy({ top: scrollNeeded, behavior: 'smooth' });
      }
    }
  }, [activeIndex]);

  if (!showLyrics) return null;

  return (
    <div className="w-[350px] bg-[#121212] border-l border-[#282828] flex flex-col h-full overflow-hidden transition-all duration-300 relative z-20">
      <div className="p-6 pb-2 shrink-0">
        <h2 className="text-xl font-bold text-white mb-1">Letra</h2>
        {currentSong && (
          <p className="text-sm text-[#a7a7a7] truncate">{currentSong.title}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full px-6 pb-24 scrollbar-hide" ref={containerRef}>
        
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <span className="text-[#a7a7a7] animate-pulse">Căutare versuri...</span>
          </div>
        )}

        {!isLoading && !lyrics && currentSong && (
          <div className="h-full flex flex-col items-center justify-center text-[#a7a7a7] opacity-60">
            <Mic size={48} className="mb-4" />
            <p>Nu s-au găsit versuri sincronizate</p>
          </div>
        )}

        {!isLoading && !currentSong && (
          <div className="h-full flex items-center justify-center text-[#a7a7a7]">
            <p>Alege o melodie pentru a vedea versurile</p>
          </div>
        )}

        {!isLoading && lyrics && (
          <div className="py-[30vh]"> {/* Padding top/bottom so first/last lines can reach the middle */}
            {lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <p 
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  className={clsx(
                    "text-[22px] font-bold leading-tight mb-5 transition-all duration-300 cursor-pointer",
                    isActive ? "text-white scale-105 origin-left" : 
                    isPast ? "text-white opacity-40 hover:opacity-100" : "text-[#7B7B7B] hover:text-white"
                  )}
                  style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
                >
                  {line.text === '' ? '♪' : line.text}
                </p>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
