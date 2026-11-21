'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  GitCommit, 
  HelpCircle, 
  Lightbulb, 
  Check,
  FileEdit,
  Target
} from 'lucide-react';

interface GrammarModule {
  id: number;
  title: string;
  topic: string;
  cefr_level: string;
  prompt: string;
  scenario_context: string;
  expected_pattern: string;
  grammar_target: string;
}

interface GrammarLabProps {
  onStatsUpdate: (stats: any) => void;
}

export default function GrammarLab({ onStatsUpdate }: GrammarLabProps) {
  const [modules, setModules] = useState<GrammarModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<GrammarModule | null>(null);
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    async function loadGrammarModules() {
      try {
        const res = await fetch('/api/modules?category=grammar_review');
        const data = await res.json();
        if (data.success && data.modules.length > 0) {
          setModules(data.modules);
          setSelectedModule(data.modules[0]);
          setInputText('We noticed the memory leak so we rebooted the worker node and we patched the vulnerability.');
        }
      } catch (err) {
        console.error('Failed to load grammar modules:', err);
      }
    }
    loadGrammarModules();
  }, []);

  const handleSelectModule = (mod: GrammarModule) => {
    setSelectedModule(mod);
    setValidationResult(null);

    if (mod.id === 9) {
      setInputText('We noticed the memory leak so we rebooted the worker node and we patched the vulnerability.');
    } else if (mod.id === 10) {
      setInputText('If the load balancer will detect an unhealthy container, it will reroute the inbound traffic.');
    } else if (mod.id === 11) {
      setInputText('Change this nested loop right now because it is too slow and destroys our database.');
    } else {
      setInputText('');
    }
  };

  const handleValidateGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedModule) return;

    setIsChecking(true);
    try {
      const res = await fetch('/api/grammar/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          textInput: inputText,
          targetGrammar: selectedModule.grammar_target
        })
      });

      const data = await res.json();
      if (data.success) {
        setValidationResult(data);
        if (data.userStats) {
          onStatsUpdate(data.userStats);
        }

        if (data.isCompleted) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Grammar validation failed:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Friendly Warm Hero Banner with Motion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-purple-950/70 via-zinc-900 to-zinc-900 border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Historia de Usuario 3 - Lizeth Perez Atanacio (UI/UX & Pedagogical Workflows)
            </span>
            <span className="text-xs text-zinc-400">Validador de Voz Pasiva y Condicionales</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileEdit className="w-7 h-7 text-purple-400" />
            <span>Laboratorio de Gramatica y Code Review</span>
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Escribe reportes de incidentes objetivos y comentarios de Pull Request constructivos. 
            El motor detecta construcciones en voz activa y errores frecuentes de condicionales (<em className="text-purple-300">"if + will"</em>), sugiriendo la correccion tecnica ideal.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Module Picker */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Talleres Practicos
            </h3>
            <span className="text-[11px] text-zinc-400">3 ejercicios</span>
          </div>

          <div className="space-y-2.5">
            {modules.map((mod) => (
              <motion.div
                key={mod.id}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => handleSelectModule(mod)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  selectedModule?.id === mod.id
                    ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/30 border-purple-500 shadow-md shadow-purple-500/10 scale-[1.01]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-lg border border-purple-500/30">
                    Nivel {mod.cefr_level}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium truncate">
                    {mod.grammar_target}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">
                  {mod.title}
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {mod.prompt}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Editor & Correction Screen with Motion */}
        <div className="lg:col-span-8 space-y-4">
          {selectedModule && (
            <motion.div 
              layout
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
            >
              {/* Exercise Context */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                      Ejercicio Activo
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {selectedModule.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold self-start sm:self-auto">
                    Meta: {selectedModule.grammar_target}
                  </span>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-2">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedModule.scenario_context}
                  </p>
                  <p className="text-xs text-purple-300 font-semibold pt-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>{selectedModule.prompt}</span>
                  </p>
                </div>
              </div>

              {/* Text Input Editor */}
              <form onSubmit={handleValidateGrammar} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Tu texto o explicacion tecnica:
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition font-sans leading-relaxed"
                    placeholder="Redacta o edita la explicacion aqui..."
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setInputText(selectedModule.expected_pattern)}
                    className="text-xs text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 transition cursor-pointer"
                  >
                    Cargar solucion ideal (B2)
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isChecking || !inputText.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 hover:from-purple-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50 cursor-pointer"
                  >
                    {isChecking ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analizando sintaxis...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Validar Gramatica y Voz Pasiva</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Results & Corrections with Motion */}
              <AnimatePresence>
                {validationResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className={`p-6 rounded-3xl border space-y-4 ${
                      validationResult.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-600/40 shadow-emerald-950/30'
                        : 'bg-rose-950/20 border-rose-600/40 shadow-rose-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          validationResult.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {validationResult.isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <AlertCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">
                            {validationResult.isCompleted ? 'Redaccion Tecnica Aprobada' : 'Sugerencias de Mejora Encontradas'}
                          </h4>
                          <p className="text-xs text-zinc-300">
                            {validationResult.summary}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Puntaje</span>
                        <div className={`text-2xl font-black font-mono ${
                          validationResult.score >= 80 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {validationResult.score}%
                        </div>
                      </div>
                    </div>

                    {/* Flag cards */}
                    {validationResult.flags && validationResult.flags.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Puntos de correccion sugeridos:
                        </div>

                        {validationResult.flags.map((flag: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400 flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-amber-400" />
                                {flag.type === 'passive_voice' ? 'Sugerencia de Voz Pasiva' : 'Correccion Condicional'}
                              </span>
                              <span className="text-rose-400 font-mono line-through bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-800/60">
                                "{flag.detected}"
                              </span>
                            </div>

                            <p className="text-zinc-300 leading-relaxed">
                              {flag.explanation}
                            </p>

                            <div className="bg-zinc-900 p-3 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-zinc-400 text-[11px] font-medium">Reemplazo profesional recomendado:</span>
                              <span className="text-emerald-400 font-semibold font-mono text-xs">
                                "{flag.suggestion}"
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ideal Solution */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-1">
                      <span className="text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                        Fraseo Estandar B2 Recomendado:
                      </span>
                      <p className="text-zinc-200 font-sans italic">
                        "{selectedModule.expected_pattern}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
