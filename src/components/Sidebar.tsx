import { NavLink } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-4 px-4 py-2 rounded-lg transition-colors font-medium",
      isActive ? "bg-white/10 text-white" : "text-[var(--color-text-secondary)] hover:text-white"
    );

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black h-full">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          MeelMusic
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 px-3 mb-8">
        <NavLink to="/" className={navLinkClass}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navLinkClass}>
          <Search size={24} />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={navLinkClass}>
          <Library size={24} />
          <span>Your Library</span>
        </NavLink>
      </nav>

      {/* Actions */}
      <div className="flex flex-col gap-2 px-3 mb-4">
        <button className="flex items-center gap-4 px-4 py-2 text-[var(--color-text-secondary)] hover:text-white transition-colors font-medium">
          <div className="bg-white/10 p-1.5 rounded-sm">
            <PlusSquare size={20} />
          </div>
          <span>Create Playlist</span>
        </button>
        <button className="flex items-center gap-4 px-4 py-2 text-[var(--color-text-secondary)] hover:text-white transition-colors font-medium">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-400 p-1.5 rounded-sm text-white">
            <Heart size={20} />
          </div>
          <span>Liked Songs</span>
        </button>
      </div>

      <div className="px-6 mb-4">
        <div className="h-px bg-white/10 w-full" />
      </div>

      {/* Playlists (Placeholder for now) */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        <ul className="flex flex-col gap-3 text-sm text-[var(--color-text-secondary)]">
          <li className="hover:text-white cursor-pointer truncate">My Awesome Mix</li>
          <li className="hover:text-white cursor-pointer truncate">Workout 2026</li>
          <li className="hover:text-white cursor-pointer truncate">Chill Vibes</li>
          <li className="hover:text-white cursor-pointer truncate">Coding Focus</li>
        </ul>
      </div>
    </aside>
  );
}
