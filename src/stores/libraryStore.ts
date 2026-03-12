import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Song } from '../types';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: number;
}

interface LibraryState {
  playlists: Playlist[];
  likedSongs: Song[];
  
  // Playlist Actions
  createPlaylist: (name: string, description?: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderPlaylist: (playlistId: string, startIndex: number, endIndex: number) => void;
  
  // Liked Songs Actions
  toggleLikeSong: (song: Song) => void;
  isLiked: (songId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      playlists: [],
      likedSongs: [],

      createPlaylist: (name, description) => set((state) => {
        const newPlaylist: Playlist = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          description: description || '',
          songs: [],
          createdAt: Date.now(),
        };
        return { playlists: [...state.playlists, newPlaylist] };
      }),

      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),

      addSongToPlaylist: (playlistId, song) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            // Avoid duplicates
            if (p.songs.some(s => s.id === song.id)) return p;
            return { ...p, songs: [...p.songs, song] };
          }
          return p;
        })
      })),

      removeSongFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, songs: p.songs.filter(s => s.id !== songId) };
          }
          return p;
        })
      })),

      reorderPlaylist: (playlistId, startIndex, endIndex) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            const result = Array.from(p.songs);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { ...p, songs: result };
          }
          return p;
        })
      })),

      toggleLikeSong: (song) => set((state) => {
        const exists = state.likedSongs.some(s => s.id === song.id);
        if (exists) {
          return { likedSongs: state.likedSongs.filter(s => s.id !== song.id) };
        } else {
          return { likedSongs: [song, ...state.likedSongs] };
        }
      }),

      isLiked: (songId) => {
        return get().likedSongs.some(s => s.id === songId);
      }
    }),
    {
      name: 'meelmusic-library', // key in localStorage
    }
  )
);
