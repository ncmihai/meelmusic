import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PlayerBar from './PlayerBar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {/* Sidebar: Fixed width left panel */}
      <Sidebar />
      
      {/* Main Content Area: Fills remaining space */}
      <div className="flex-1 bg-[#121212] rounded-lg mt-2 mr-2 mb-26 overflow-y-auto relative">
        {/* We add margin bottom (mb-26) so the content doesn't get hidden behind the 24-height PlayerBar */}
        <Outlet />
      </div>

      {/* Persistent Footer Player */}
      <PlayerBar />
    </div>
  );
}
