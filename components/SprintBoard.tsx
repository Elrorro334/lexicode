'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Code2, 
  BrainCircuit, 
  Database, 
  Flame, 
  HelpCircle, 
  Lightbulb, 
  BookOpen,
  Calendar,
  Award,
  Zap,
  Check
} from 'lucide-react';

interface SprintItem {
  id: number;
  category: string;
  title: string;
  topic: string;
  cefr_level: string;
  prompt: string;
  scenario_context: string;
  expected_pattern: string;
  keywords: string;
  grammar_target: string;
  srs_id: number;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string;
}

interface SprintBoardProps {
  onStatsUpdate: (stats: any) => void;
}

export default function SprintBoard({ onStatsUpdate }: SprintBoardProps) {
  const [items, setItems] = useState<SprintItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sprintStarted, setSprintStarted] = useState(false);

  const fetchOverdueSprint = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/sprint');
      const data = await res.json();
      if (data.success && data.items) {
        setItems(data.items);
        setCurrentIndex(0);
        setSprintStarted(true);
        setUserAnswer('');
      }
    } catch (err) {
      console.error('Error fetching sprint items:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = items[currentIndex];

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentItem) return;

    setEvaluating(true);
    try {
      const res = await fetch('/api/sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: currentItem.id,
          userResponse: userAnswer
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        if (data.userStats) {
          onStatsUpdate(data.userStats);
        }

        if (data.isCorrect) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextCard = () => {
    setResult(null);
    setUserAnswer('');
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      fetchOverdueSprint();
    }
  };

  return (
    <div className="space-y-6">
      {/* Friendly Warm Hero Banner with Motion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Historia de Usuario 1 - Alberto Cruz Zepeda (Full-Stack Lead)
            </span>
            <span className="text-xs text-zinc-400">Algoritmo SM-2 de Repeticion Espaciada</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-amber-400" />
            <span>Vocabulario Tecnico Diario (Spaced Repetition)</span>
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Domina el lexico que piden los Tech Leads en entrevistas internacionales (<em className="text-amber-200">throughput, middleware, deadlocks, race conditions</em>). 
            La plataforma calcula tu curva de olvido y programa repasos inteligentes.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchOverdueSprint}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>{sprintStarted ? 'Recargar Tarjetas Pendientes' : 'Comenzar Sprint de Vocabulario'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {!sprintStarted ? (
        /* Friendly Welcome Call to Action */
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 text-center space-y-4 max-w-2xl mx-auto shadow-sm"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Listo para tu repaso diario?</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
              El motor consulta tu tabla en SQLite <code className="text-amber-300">SpacedRepetitionLog</code> y carga las 10 tarjetas que vencen hoy para afianzar tu memoria a largo plazo.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={fetchOverdueSprint}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-amber-600/25 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar Practica Ahora</span>
          </motion.button>
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 text-center space-y-3 max-w-lg mx-auto"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Todo al dia por hoy</h3>
          <p className="text-sm text-zinc-400">
            Has repasado todas tus tarjetas pendientes. Vuelve manana para la siguiente tanda calculada por el algoritmo.
          </p>
        </motion.div>
      ) : (
        /* Friendly Flashcard Card with Animated Transition */
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl max-w-4xl mx-auto"
          >
            {/* Card Top Pill Bar */}
            <div className="bg-zinc-950/70 px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  Tarjeta {currentIndex + 1} de {items.length}
                </span>
                <span className="font-semibold text-zinc-400">
                  Nivel {currentItem.cefr_level}
                </span>
                <span className="text-zinc-600">-</span>
                <span className="text-emerald-300 font-medium truncate">
                  {currentItem.topic}
                </span>
              </div>

              <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Intervalo: {currentItem.interval_days}d</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Prompt */}
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {currentItem.title}
                </h3>

                <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4" />
                    <span>Escenario en la Empresa</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {currentItem.scenario_context}
                  </p>
                </div>

                <div className="text-sm text-zinc-100 font-medium">
                  <span className="text-emerald-400 font-bold">Tu Pregunta Tecnica: </span>
                  {currentItem.prompt}
                </div>

                {/* Hints */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-zinc-400 font-medium">Estructura Sugerida:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30">
                    {currentItem.grammar_target}
                  </span>
                  <span className="text-zinc-400 font-medium ml-2">Palabras Clave:</span>
                  {currentItem.keywords.split(',').slice(0, 4).map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Answer Box */}
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Escribe tu explicacion en ingles:
                  </label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Escribe aqui tu definicion tecnica en ingles..."
                    rows={3}
                    disabled={evaluating || !!result}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none transition font-sans leading-relaxed"
                  />
                </div>

                {!result ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setUserAnswer(currentItem.expected_pattern)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 transition cursor-pointer"
                    >
                      Usar respuesta de referencia (B2)
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={evaluating || !userAnswer.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                    >
                      {evaluating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Comprobando respuesta...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Evaluar Retencion de Vocabulario</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : null}
              </form>

              {/* Result Box with Motion */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-6 rounded-3xl border space-y-4 ${
                      result.isCorrect 
                        ? 'bg-emerald-950/20 border-emerald-600/40' 
                        : 'bg-rose-950/20 border-rose-600/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          result.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {result.isCorrect ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <AlertTriangle className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">
                            {result.isCorrect ? 'Excelente. Termino Retenido' : 'Necesita Refuerzo'}
                          </h4>
                          <p className="text-xs text-zinc-300">
                            {result.isCorrect 
                              ? 'Has demostrado dominio del vocabulario tecnico.' 
                              : 'Criterio 2: Reprogramado automaticamente dentro de 24 horas.'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Puntaje</span>
                        <div className={`text-2xl font-black font-mono ${
                          result.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {result.score}%
                        </div>
                      </div>
                    </div>

                    {/* Algorithmic Schedule Badge */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-xs flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <div className="text-zinc-300 font-medium">
                        <strong>Proximo repaso segun algoritmo SM-2: </strong>
                        <span className={result.isCorrect ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                          {new Date(result.nextReviewAt).toLocaleDateString()} ({result.intervalDays} dia(s))
                        </span>
                      </div>
                    </div>

                    {/* Reference Answer */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-xs space-y-1">
                      <span className="text-zinc-400 font-bold uppercase text-[10px]">
                        Fraseo de Referencia en Ingles:
                      </span>
                      <p className="text-zinc-200 font-sans italic">
                        "{currentItem.expected_pattern}"
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNextCard}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-600/30"
                      >
                        <span>{currentIndex < items.length - 1 ? 'Siguiente Tarjeta' : 'Terminar Sprint'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
