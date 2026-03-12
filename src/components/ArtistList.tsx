import { useNavigate } from 'react-router-dom';

interface ArtistListProps {
  artists: string;
  className?: string;
}

export default function ArtistList({ artists, className = '' }: ArtistListProps) {
  const navigate = useNavigate();
  
  // JioSaavn often returns multiple artists separated by commas
  const artistArray = artists.split(',').map(a => a.trim());
  
  return (
    <span className={`inline-block truncate ${className}`} title={artists}>
      {artistArray.map((artist, index) => (
        <span key={index}>
          <span 
            className="hover:underline hover:text-white cursor-pointer transition-colors" 
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/artist/${encodeURIComponent(artist)}`); 
            }}
          >
            {artist}
          </span>
          {index < artistArray.length - 1 && ', '}
        </span>
      ))}
    </span>
  );
}
