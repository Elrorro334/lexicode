'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SprintBoard from '@/components/SprintBoard';
import StandupSpeechRoom from '@/components/StandupSpeechRoom';
import GrammarLab from '@/components/GrammarLab';
import TelemetryDashboard from '@/components/TelemetryDashboard';
import TrackSelectorModal from '@/components/TrackSelectorModal';
import { 
  Flame, 
  UserCheck
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sprint' | 'standup' | 'grammar' | 'telemetry'>('standup');
  const [userStats, setUserStats] = useState<any>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const loadUser = async () => {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      if (data.success && data.user) {
        setUserStats(data.user);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleStatsUpdate = (newStats: any) => {
    setUserStats((prev: any) => ({ ...prev, ...newStats }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Friendly Navigation (No Blue, No Emojis) */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab: any) => setActiveTab(tab)} 
        userStats={userStats}
        onOpenTrackModal={() => setIsTrackModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Friendly Greeting Card with Motion */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-r from-zinc-900 via-emerald-950/25 to-zinc-900 border border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hola de nuevo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Rodrigo</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Listo para practicar
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl pt-1">
                Practica la explicacion de tu standup de hoy o repasa tus tarjetas de vocabulario. Cada ejercicio te acerca a tu meta profesional B2.
              </p>
            </div>

            {/* Quick motivators */}
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="px-3.5 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-zinc-300 font-medium">Meta de hoy:</span>
                <strong className="text-white">1 Standup + 5 Terminos</strong>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Screen Tabs with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === 'standup' && (
            <motion.div
              key="standup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <StandupSpeechRoom onStatsUpdate={handleStatsUpdate} />
            </motion.div>
          )}

          {activeTab === 'sprint' && (
            <motion.div
              key="sprint"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SprintBoard onStatsUpdate={handleStatsUpdate} />
            </motion.div>
          )}

          {activeTab === 'grammar' && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <GrammarLab onStatsUpdate={handleStatsUpdate} />
            </motion.div>
          )}

          {activeTab === 'telemetry' && (
            <motion.div
              key="telemetry"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <TelemetryDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 py-6 px-4 text-xs text-zinc-400 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-white font-bold">LexiCode Capstone</span>
            <span className="text-zinc-600">-</span>
            <span>Universidad Tecnologica - 10 IDSM</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-zinc-400">
            <span>Desarrollado con dedicacion por el Equipo de Ingenieria: Alberto, Rodrigo, Lizeth y Oscar.</span>
          </div>
        </div>
      </footer>

      {/* Modal for Track / CEFR placement */}
      <TrackSelectorModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        currentTrack={userStats?.track || 'Full-Stack'}
        currentCefr={userStats?.cefr_level || 'B1'}
        onUpdate={handleStatsUpdate}
      />
    </div>
  );
}
