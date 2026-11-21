'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Database, 
  ShieldCheck, 
  Award, 
  Flame, 
  RefreshCw, 
  CheckCircle2, 
  Terminal, 
  Activity, 
  User, 
  Sparkles,
  Check
} from 'lucide-react';

interface TelemetryData {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    track: string;
    cefr_level: string;
    streak_days: number;
    merged_prs: number;
    deployments: number;
    created_at: string;
  };
  srsStats: {
    total: number;
    overdue: number;
    mastered: number;
  };
  recentScores: Array<{
    id: number;
    exercise_type: string;
    accuracy_score: number;
    is_completed: number;
    created_at: string;
    title: string;
    category: string;
    cefr_level: string;
  }>;
  radar: Array<{
    subject: string;
    value: number;
    fullMark: number;
    cefr: string;
  }>;
}

export default function TelemetryDashboard() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      {/* Friendly Warm Header with Motion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-emerald-950/70 via-zinc-900 to-zinc-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Telemetria y Registro en Tiempo Real
            </span>
            <span className="text-xs text-zinc-400">Secciones 3 y 4 del SRS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            <span>Mi Progreso y Base de Datos Relacional</span>
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Monitorea tu evolucion hacia el nivel profesional B2. Cada ejercicio que completas en los modulos anteriores se almacena en SQLite con integridad referencial.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchTelemetry}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold border border-zinc-700 transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Metricas</span>
        </motion.button>
      </motion.div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CEFR Radar & Competencies */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">Radar de Competencias CEFR (B1 a B2)</h3>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Objetivo: B2 Profesional
              </span>
            </div>

            <div className="space-y-4">
              {data.radar.map((skill, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-200 font-semibold">{skill.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800 font-bold">
                        {skill.cefr}
                      </span>
                      <span className="font-mono font-bold text-white">{skill.value}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* SRS Queue Health */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-2xl font-black font-mono text-white">{data.srsStats.total}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Total de Tarjetas</div>
              </div>
              <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-2xl font-black font-mono text-amber-400">{data.srsStats.overdue}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Pendientes Hoy</div>
              </div>
              <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800">
                <div className="text-2xl font-black font-mono text-emerald-400">{data.srsStats.mastered}</div>
                <div className="text-[11px] text-zinc-400 mt-1">Retenidas</div>
              </div>
            </div>
          </motion.div>

          {/* Gamification & Profile */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Engineer Profile Card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-600/30">
                    RS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">{data.user.name}</h4>
                    <p className="text-xs text-zinc-400">{data.user.role}</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {data.user.track}
                </span>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div 
                  whileHover={{ scale: 1.04 }}
                  className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-center"
                >
                  <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-pulse" />
                  <div className="text-xl font-black font-mono text-white">{data.user.streak_days} dias</div>
                  <div className="text-[11px] text-zinc-400">Racha de Practica</div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.04 }}
                  className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xl font-black font-mono text-white">{data.recentScores.length}</div>
                  <div className="text-[11px] text-zinc-400">Practicas Realizadas</div>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.04 }}
                  className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 text-center"
                >
                  <ShieldCheck className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                  <div className="text-xl font-black font-mono text-white">{data.user.cefr_level}</div>
                  <div className="text-[11px] text-zinc-400">Nivel Asignado</div>
                </motion.div>
              </div>
            </div>

            {/* Relational SQL Queries */}
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-300 font-bold border-b border-zinc-800 pb-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Consultas SQL Parametrizadas (En Vivo)</span>
              </div>
              <div className="text-zinc-400 space-y-1.5 text-[11px] overflow-x-auto">
                <div className="text-emerald-400">
                  SELECT * FROM Users WHERE id = 1;
                </div>
                <div className="text-amber-400">
                  SELECT m.title, s.next_review_at FROM Modules m JOIN SpacedRepetitionLog s ON m.id = s.module_id;
                </div>
                <div className="text-purple-400">
                  INSERT INTO ExerciseScores (user_id, module_id, accuracy_score) VALUES (?, ?, ?);
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Live Table: ExerciseScores */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="bg-zinc-950/90 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm">
              Historial de Intentos: Tabla <code className="text-emerald-300 font-mono">ExerciseScores</code>
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Persistencia Relacional en SQLite
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider font-semibold text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Ejercicio</th>
                <th className="px-6 py-3.5">Modulo</th>
                <th className="px-6 py-3.5">Nivel</th>
                <th className="px-6 py-3.5">Puntaje</th>
                <th className="px-6 py-3.5">Resultado</th>
                <th className="px-6 py-3.5">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 font-sans">
              {data && data.recentScores && data.recentScores.length > 0 ? (
                data.recentScores.map((score) => (
                  <tr key={score.id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4 font-mono text-zinc-400">#{score.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{score.title}</td>
                    <td className="px-6 py-4 text-zinc-300 font-mono text-[11px]">
                      {score.exercise_type}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-zinc-300">
                      {score.cefr_level}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={score.accuracy_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                        {score.accuracy_score}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {score.is_completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Aprobado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                          En Practica
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-[11px]">
                      {new Date(score.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-400 italic">
                    Aun no hay intentos registrados. Realiza una practica de standup o vocabulario para ver tus datos aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
