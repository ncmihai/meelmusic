import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '../types';

// ========================================
// Player Store - Zustand State Management
// ========================================

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  progress: number; // current time in seconds
  duration: number; // total time in seconds
  queue: Song[];
  history: Song[];
  seekTarget: number | null; // time to seek to (handled by AudioPlayer)
  showLyrics: boolean; // toggle for Lyrics panel
  showQueue: boolean; // toggle for Queue panel
  
  // Actions
  play: (song?: Song) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  clearSeek: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  clearQueue: () => void;
  toggleLyrics: () => void;
  toggleQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      volume: 0.5,
      progress: 0,
      duration: 0,
      queue: [],
      history: [],
      seekTarget: null,
      showLyrics: false,
      showQueue: false,

      toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics, showQueue: false })),
      toggleQueue: () => set((state) => ({ showQueue: !state.showQueue, showLyrics: false })),

      seek: (time: number) => set({ seekTarget: time, progress: time }),
      clearSeek: () => set({ seekTarget: null }),

      play: (song?: Song) => {
        if (song) {
          const { currentSong, history } = get();
          
          // If playing a new song that isn't the current one
          if (currentSong?.id !== song.id) {
            let newHistory = currentSong ? [...history, currentSong] : [...history];
            if (newHistory.length > 50) newHistory = newHistory.slice(newHistory.length - 50);

            set({ 
              currentSong: song, 
              isPlaying: true, 
              progress: 0,
              history: newHistory
            });
          } else {
            // Resume playing the exact same song
            set({ isPlaying: true });
          }
        } else {
          // Just resume whatever is loaded
          set({ isPlaying: true });
        }
      },

      pause: () => set({ isPlaying: false }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      next: () => {
        const { queue, currentSong, history } = get();
        if (queue.length > 0) {
          const nextSong = queue[0];
          const newQueue = queue.slice(1);
          
          let newHistory = currentSong ? [...history, currentSong] : [...history];
          if (newHistory.length > 50) newHistory = newHistory.slice(newHistory.length - 50);

          set({ 
            currentSong: nextSong, 
            isPlaying: true, 
            progress: 0, 
            queue: newQueue,
            history: newHistory
          });
        } else {
          // End of queue -> pause
          set({ isPlaying: false, progress: 0 });
        }
      },

      prev: () => {
        const { progress, history, currentSong, queue } = get();
        // If we've played more than 3 seconds, just restart current song
        if (progress > 3 || history.length === 0) {
          set({ progress: 0 });
        } else {
          // Go back to previous song from history
          const previousSong = history[history.length - 1];
          const newHistory = history.slice(0, -1);
          
          set({ 
            currentSong: previousSong,
            isPlaying: true,
            progress: 0,
            history: newHistory,
            // Put the old current song back to the top of the queue
            queue: currentSong ? [currentSong, ...queue] : queue
          });
        }
      },

      setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      
      setProgress: (progress: number) => set({ progress }),
      
      setDuration: (duration: number) => set({ duration }),

      addToQueue: (song: Song) => set((state) => {
        // Prevent exactly identical songs from crowding the queue sequentially
        if (state.queue[state.queue.length - 1]?.id === song.id) {
          return state;
        }
        return { queue: [...state.queue, song] };
      }),

      setQueue: (songs: Song[]) => set({ queue: songs }),

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'meelmusic-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        currentSong: state.currentSong,
        queue: state.queue,
        history: state.history,
      }),
    }
  )
);
