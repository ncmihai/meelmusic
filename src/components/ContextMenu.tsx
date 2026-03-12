import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ListPlus, Download, CheckCircle, PlusSquare, ArrowRightCircle } from 'lucide-react';
import { useDownloadStore } from '../stores/downloadStore';
import { useModalStore } from '../stores/modalStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { useNavigate } from 'react-router-dom';
import type { Song } from '../types';
import clsx from 'clsx';

interface ContextMenuProps {
  song: Song;
}

export default function ContextMenu({ song }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isDownloaded, downloadSong, deleteSong } = useDownloadStore();
  const { openCreatePlaylist } = useModalStore();
  const { playlists, addSongToPlaylist } = useLibraryStore();
  const { addToQueue } = usePlayerStore();
  const navigate = useNavigate();

  const downloaded = isDownloaded(song.id);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowPlaylists(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDownload = () => {
    if (downloaded) {
      if (confirm('Ștergi melodia din memoria telefonului?')) {
        deleteSong(song.id);
      }
    } else {
      downloadSong(song);
    }
    setIsOpen(false);
  };

  const handleCreatePlaylist = () => {
    openCreatePlaylist();
    // Can't auto-add yet because create returns void. User will have to do it next time.
    setIsOpen(false);
    setShowPlaylists(false);
  };

  const addItemToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
    setIsOpen(false);
    setShowPlaylists(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          setShowPlaylists(false);
        }}
        className="p-2 text-[#b3b3b3] hover:text-white transition-colors hover:bg-white/10 rounded-full"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-48 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-xl z-50 flex flex-col py-1 text-sm font-medium">
          
          <button 
             onClick={(e) => {
               e.stopPropagation();
               addToQueue(song);
               setIsOpen(false);
             }}
             className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left w-full transition-colors"
          >
            <ArrowRightCircle size={16} className="text-[#b3b3b3]" />
            Add to Queue
          </button>

          <button 
             onClick={(e) => {
               e.stopPropagation();
               setShowPlaylists(!showPlaylists);
             }}
             className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left w-full transition-colors justify-between"
          >
            <div className="flex items-center gap-3">
              <ListPlus size={16} className="text-[#b3b3b3]" />
              Add to Playlist
            </div>
          </button>

          {/* Sub menu for Playlists */}
          {showPlaylists && (
            <div className="bg-[#1e1e1e] mx-2 rounded-md mb-2 flex flex-col max-h-40 overflow-y-auto custom-scrollbar border border-white/5">
               <button 
                 onClick={handleCreatePlaylist}
                 className="flex items-center gap-2 px-3 py-2 text-[#1db954] hover:bg-white/5 text-left w-full transition-colors border-b border-white/5"
               >
                 <PlusSquare size={14} /> Crează Nou
               </button>
               {playlists.map(pl => (
                 <button
                   key={pl.id}
                   onClick={(e) => {
                     e.stopPropagation();
                     addItemToPlaylist(pl.id);
                   }}
                   className="px-3 py-2 text-[#b3b3b3] hover:text-white hover:bg-white/5 text-left w-full transition-colors truncate"
                 >
                   {pl.name}
                 </button>
               ))}
               {playlists.length === 0 && (
                 <div className="text-xs text-center p-2 text-gray-500 italic border-t border-white/5">
                   Niciun playlist salvat
                 </div>
               )}
            </div>
          )}

          <div className="h-px bg-white/10 w-full my-1" />

          <button 
             onClick={(e) => {
               e.stopPropagation();
               handleDownload();
             }}
             className={clsx(
               "flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left w-full transition-colors",
               downloaded ? "text-[#1db954]" : "text-white"
             )}
          >
            {downloaded ? <CheckCircle size={16} /> : <Download size={16} className="text-[#b3b3b3]" />}
            {downloaded ? 'Șterge Download' : 'Download Offline'}
          </button>

          <button 
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/artist/${encodeURIComponent(song.artist)}`);
               setIsOpen(false);
             }}
             className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 text-left w-full transition-colors"
          >
            <div className="w-4 h-4 rounded-full border-2 border-[#b3b3b3] flex items-center justify-center shrink-0">
               <div className="w-1.5 h-1.5 bg-[#b3b3b3] rounded-full" />
            </div>
            Vezi Artistul
          </button>
          
        </div>
      )}
    </div>
  );
}
