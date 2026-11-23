import React from 'react';
import { useAuth } from '../context/AuthContext';

interface TrackFilterBarProps {
  selectedTrack: string;
  onSelectTrack: (track: string) => void;
}

const TRACKS = ['All', 'Full-Stack', 'QA', 'DevOps'];

export default function TrackFilterBar({ selectedTrack, onSelectTrack }: TrackFilterBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-ide-muted font-mono">Especialidad:</span>
      {TRACKS.map((t) => {
        const isUserTrack = user?.track === t;
        const label = t === 'All' ? 'Todas' : isUserTrack ? `${t} (Tu ruta)` : t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelectTrack(t)}
            className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
              selectedTrack === t
                ? 'bg-ide-accentSoft border-ide-accent text-ide-accent'
                : 'bg-ide-surface border-ide-border text-ide-muted hover:text-ide-text'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
