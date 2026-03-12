import { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const { user } = useAuth();
  
  useEffect(() => {
    // Keep input in sync if URL changes externally
    if (searchParams.get('q') !== query) {
      setQuery(searchParams.get('q') || '');
    }
  }, [searchParams]);

  // Clear input if we leave the search page
  useEffect(() => {
    if (!location.pathname.startsWith('/search')) {
      setQuery('');
    }
  }, [location.pathname]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`, { replace: true });
    } else {
      // If they clear the input, just stay on /search to show recommendations
      if (location.pathname.startsWith('/search')) {
        navigate(`/search`, { replace: true });
      }
    }
  };

  return (
    <div className="h-16 bg-transparent flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 w-full">
        {/* Navigation Arrows */}
        <div className="flex gap-2 hidden sm:flex">
          <button 
            onClick={() => navigate(-1)} 
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-[#a7a7a7] hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={() => navigate(1)} 
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center text-[#a7a7a7] hover:text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Global Search Input */}
        <div className="relative w-full max-w-[360px] sm:ml-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <SearchIcon size={20} className="text-[#121212]" />
          </div>
          <input
            type="text"
            className="w-full bg-white text-black text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white border-2 border-transparent transition-all font-medium placeholder-gray-500"
            placeholder="Ce vrei să asculți?"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center ml-4 shrink-0">
         {/* User Initial Badge */}
         {user && (
           <div 
             className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black font-bold text-sm shadow-md" 
             title={user.user_metadata?.full_name || user.email || 'User'}
           >
             {(user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
           </div>
         )}
      </div>
    </div>
  );
}
