import { useState } from 'react';
import Modal from '../ui/Modal';
import { useModalStore } from '../../stores/modalStore';
import { useLibraryStore } from '../../stores/libraryStore';

export default function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, closeCreatePlaylist } = useModalStore();
  const { createPlaylist } = useLibraryStore();
  
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a playlist name.');
      return;
    }
    createPlaylist(name.trim());
    setName('');
    setError('');
    closeCreatePlaylist();
  };

  const handleClose = () => {
    setName('');
    setError('');
    closeCreatePlaylist();
  };

  return (
    <Modal
      isOpen={isCreatePlaylistOpen}
      onClose={handleClose}
      title="Create Playlist"
    >
      <form onSubmit={handleCreate} className="flex flex-col gap-6">
        <div>
          <label htmlFor="playlist-name" className="block text-sm font-bold text-white mb-2">
            Nume
          </label>
          <input
            id="playlist-name"
            type="text"
            className="w-full bg-[#3e3e3e] text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
            placeholder="Ex: Chill Mix 2026"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 rounded-full font-bold text-white hover:scale-105 transition-transform"
          >
            Anulează
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-full font-bold bg-white text-black hover:scale-105 transition-transform"
          >
            Crează
          </button>
        </div>
      </form>
    </Modal>
  );
}
