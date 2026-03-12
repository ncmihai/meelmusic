import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';
import LyricsPanel from './LyricsPanel';
import QueuePanel from './QueuePanel';
import { usePlayerStore } from '../stores/playerStore';

export default function MainLayout() {
  const { showLyrics, showQueue } = usePlayerStore();

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar: Fixed width left panel */}
      <Sidebar />
      
      {/* Container for Main Content Area & Lyrics Panel (flex row) */}
      <div className="flex-1 flex flex-row overflow-hidden mt-2 mr-2 mb-[100px] relative">
        
        {/* Main Content Area: Flexes to fill remaining space. 
            When lyrics are open, it naturally scales down via flex-1 constraint. */}
        <div className="flex-1 bg-[#121212] rounded-lg overflow-hidden flex flex-col relative transition-all duration-300">
          <Outlet />
        </div>

        {/* Lyrics Panel: Slides in from right */}
        {showLyrics && (
           <div className="ml-2 bg-[#121212] rounded-lg overflow-hidden animate-slide-left shadow-2xl shrink-0">
             <LyricsPanel />
           </div>
        )}

        {/* Queue Panel: Slides in from right (Mutually exclusive with Lyrics) */}
        {showQueue && (
           <div className="ml-2 bg-[#121212] rounded-lg overflow-hidden animate-slide-left shadow-2xl shrink-0">
             <QueuePanel />
           </div>
        )}
      </div>

      {/* Persistent Footer Player */}
      <PlayerBar />
    </div>
  );
}
