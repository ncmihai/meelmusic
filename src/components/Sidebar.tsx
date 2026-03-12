import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      "flex items-center gap-4 px-4 py-2 rounded-md transition-colors font-medium",
      isActive ? "bg-[#282828] text-white" : "text-[#b3b3b3] hover:text-white"
    );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-black h-full pb-24">
      {/* Logo & Auth Section */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-6">
          MeelMusic
        </h1>
        
        {/* User Profile / Login Button */}
        {user ? (
          <div className="flex items-center justify-between bg-[#121212] p-3 rounded-lg border border-[#282828]">
            <div className="flex items-center gap-3 overflow-hidden">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
              <span className="text-sm font-bold text-white truncate max-w-[100px]">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 px-4 rounded-full hover:scale-105 transition-transform"
          >
            <LogIn size={18} />
            Autentificare
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 px-3 mt-6 mb-8">
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
