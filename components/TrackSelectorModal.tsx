'use client';

import React, { useState } from 'react';
import { X, Check, Code, ShieldCheck, Terminal, Compass, Sparkles } from 'lucide-react';

interface TrackSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: string;
  currentCefr: string;
  onUpdate: (newStats: any) => void;
}

export default function TrackSelectorModal({
  isOpen,
  onClose,
  currentTrack,
  currentCefr,
  onUpdate
}: TrackSelectorModalProps) {
  const [selectedTrack, setSelectedTrack] = useState(currentTrack || 'Full-Stack');
  const [selectedCefr, setSelectedCefr] = useState(currentCefr || 'B1');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const tracks = [
    {
      id: 'Full-Stack',
      name: 'Full-Stack Engineer',
      description: 'Enfocado en React, Node.js, arquitectura cliente-servidor y debates de APIs REST.',
      icon: Code,
      color: 'bg-emerald-600'
    },
    {
      id: 'DevOps',
      name: 'DevOps Specialist',
      description: 'Enfocado en CI/CD, tolerancia a fallos, monitoreo e incidentes de infraestructura.',
      icon: Terminal,
      color: 'bg-purple-600'
    },
    {
      id: 'QA',
      name: 'QA Automation Engineer',
      description: 'Enfocado en reporte de defectos, suite de pruebas automatizadas y triaje de bugs.',
      icon: ShieldCheck,
      color: 'bg-amber-600'
    }
  ];

  const cefrLevels = [
    { level: 'B1', title: 'Independiente', desc: 'Comprende requerimientos técnicos estándar.' },
    { level: 'B1+', title: 'Ágil Intermedio', desc: 'Respuestas espontáneas en dailies sin trabas.' },
    { level: 'B2', title: 'Profesional', desc: 'Defiende decisiones arquitectónicas y debates técnicos.' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track: selectedTrack,
          cefr_level: selectedCefr
        })
      });

      const json = await res.json();
      if (json.success && json.user) {
        onUpdate(json.user);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update track:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Tu Perfil Profesional</h3>
              <p className="text-xs text-zinc-400">Personaliza tus ejercicios según tu especialidad</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Career Track Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Elige tu especialidad tecnológica:
          </label>
          <div className="space-y-2.5">
            {tracks.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTrack === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrack(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-emerald-600/15 border-emerald-500 shadow-sm'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mt-0.5 ${isSelected ? t.color + ' text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm flex items-center justify-between">
                      <span>{t.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{t.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CEFR Diagnostic Level */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Nivel de fluidez objetivo (Marco CEFR):
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {cefrLevels.map((lvl) => {
              const isSelected = selectedCefr === lvl.level;
              return (
                <div
                  key={lvl.level}
                  onClick={() => setSelectedCefr(lvl.level)}
                  className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 shadow-sm'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="font-black text-lg text-emerald-400 font-mono">{lvl.level}</div>
                  <div className="text-xs font-bold text-white mt-1">{lvl.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar y Actualizar'}
          </button>
        </div>
      </div>
    </div>
  );
}
