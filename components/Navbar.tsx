'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Flame, 
  Mic, 
  Zap, 
  FileEdit, 
  BarChart3, 
  User, 
  ChevronRight,
  Code2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userStats: {
    name: string;
    role: string;
    track: string;
    cefr_level: string;
    streak_days: number;
    merged_prs: number;
    deployments: number;
  } | null;
  onOpenTrackModal: () => void;
}

export default function Navbar({ activeTab, setActiveTab, userStats, onOpenTrackModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 shadow-sm">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('sprint')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  Lexi<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Code</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Ingles Tecnico para Ingenieros de Software
              </p>
            </div>
          </motion.div>

          {/* User Profile & Streak Widget */}
          {userStats && (
            <div className="hidden md:flex items-center gap-3">
              {/* Streak Widget */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1 text-xs">
                  <span className="font-extrabold text-amber-300 font-mono text-sm">{userStats.streak_days}</span>
                  <span className="text-zinc-400 text-[11px] font-medium">dias de racha</span>
                </div>
              </motion.div>

              {/* User Track & CEFR Selector */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenTrackModal}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer shadow-sm group"
                title="Cambiar Especialidad y Nivel CEFR"
              >
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs font-mono">
                  {userStats.cefr_level}
                </span>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {userStats.track}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            </div>
          )}

          {/* Mobile Profile Trigger */}
          <div className="md:hidden">
            <button
              onClick={onOpenTrackModal}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Zero emojis, Lucide SVG icons only) */}
        <nav className="flex space-x-2 pb-3 overflow-x-auto no-scrollbar">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('standup')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'standup'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/70'
            }`}
          >
            <Mic className="w-4 h-4 text-emerald-300" />
            <span>Practica de Standup (Voz)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono">
              US-2
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('sprint')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sprint'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/70'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Vocabulario Diario (SRS)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono">
              US-1
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'grammar'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/70'
            }`}
          >
            <FileEdit className="w-4 h-4 text-purple-300" />
            <span>Code Review y Gramatica</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 text-white font-mono">
              US-3
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-teal-300" />
            <span>Mi Progreso y Base de Datos</span>
          </motion.button>
        </nav>
      </div>
    </header>
  );
}
