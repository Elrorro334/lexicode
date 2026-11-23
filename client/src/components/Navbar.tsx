import React from 'react';
import {
  BarChart3,
  BookOpen,
  Code2,
  Flame,
  GitPullRequest,
  LogOut,
  Map,
  Mic,
  Palette,
  Rocket,
  SlidersHorizontal,
  Terminal,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'path' | 'sprint' | 'grammar' | 'scrum' | 'interview' | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenOnboarding: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenOnboarding }: NavbarProps) {
  const { user, theme, toggleTheme, logout } = useAuth();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'path', label: 'Mi Ruta', icon: <Map className="w-4 h-4" /> },
    { id: 'sprint', label: 'Vocabulario', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'grammar', label: 'Ejercicios', icon: <Wrench className="w-4 h-4" /> },
    { id: 'scrum', label: 'Hablar (Scrum)', icon: <Mic className="w-4 h-4" /> },
    { id: 'interview', label: 'Entrevista', icon: <Terminal className="w-4 h-4" /> },
    { id: 'analytics', label: 'Progreso', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ide-border bg-ide-surface/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Marca */}
        <button
          onClick={() => setActiveTab('path')}
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-ide-accentSoft border border-ide-accent/40 flex items-center justify-center text-ide-accent">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-ide-text text-base">LexiCode</span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-ide-panel border border-ide-border text-ide-accent">
                Nivel {user?.cefr_level || 'B1'}
              </span>
            </div>
            <p className="text-[11px] text-ide-muted font-mono">
              Ruta {user?.track || 'Full-Stack'} • Inglés Técnico
            </p>
          </div>
        </button>

        {/* Menú principal en español claro */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-ide-accent text-ide-bg shadow-sm'
                    : 'text-ide-muted hover:text-ide-text hover:bg-ide-panel border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Indicadores y ajustes */}
        <div className="flex items-center gap-2 text-xs">
          <div
            title="Racha diaria de práctica"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-warn font-mono"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{user?.streak_days ?? 1}d</span>
          </div>
          <div
            title="Ejercicios aprobados (Pull Requests)"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-success font-mono"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>{user?.merged_prs ?? 0}</span>
          </div>
          <div
            title="Hitos desbloqueados (Deployments)"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-accent font-mono"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{user?.deployments ?? 0}</span>
          </div>

          <button
            onClick={onOpenOnboarding}
            title="Cambiar especialidad o repetir examen diagnóstico"
            className="p-2 rounded-xl bg-ide-panel border border-ide-border text-ide-muted hover:text-ide-text transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={toggleTheme}
            title="Cambiar colores del editor (VS Code Dark / Nord)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-muted hover:text-ide-text transition-colors font-mono"
          >
            <Palette className="w-3.5 h-3.5 text-ide-accent" />
            <span className="hidden lg:inline">{theme === 'vscode-dark' ? 'VS Dark' : 'Nord'}</span>
          </button>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-ide-panel border border-ide-border text-ide-muted hover:text-ide-danger transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
