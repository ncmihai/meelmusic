import { create } from 'zustand';

interface ModalState {
  isCreatePlaylistOpen: boolean;
  openCreatePlaylist: () => void;
  closeCreatePlaylist: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isCreatePlaylistOpen: false,
  openCreatePlaylist: () => set({ isCreatePlaylistOpen: true }),
  closeCreatePlaylist: () => set({ isCreatePlaylistOpen: false }),
}));
