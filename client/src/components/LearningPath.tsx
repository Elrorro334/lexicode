import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Mic,
  Play,
  Sparkles,
  Terminal,
  Trophy,
  Wrench
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { ActiveTab } from './Navbar';

interface LearningPathProps {
  onNavigate: (tab: ActiveTab, subHint?: string) => void;
}

export default function LearningPath({ onNavigate }: LearningPathProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/analytics')
      .then((res) => setAnalytics(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const aggMap: Record<string, { completed: number; attempts: number }> = {};
  for (const row of analytics?.avgByCategory || []) {
    aggMap[row.exercise_type] = {
      completed: Number(row.completed || 0),
      attempts: Number(row.attempts || 0)
    };
  }

  const masteredCards = analytics?.srsStats?.mastered || 0;
  const totalCards = analytics?.srsStats?.total || 12;
  const quizCompleted = (aggMap.grammar_quiz?.completed || 0) + (aggMap.fill_blank?.completed || 0);
  const rcaCompleted = aggMap.grammar_incident?.completed || 0;
  const scrumCompleted = (aggMap.speech_standup?.completed || 0) + (aggMap.sprint_audio?.completed || 0);
  const interviewCompleted = aggMap.tech_interview?.completed || 0;

  const units = [
    {
      step: 1,
      tab: 'sprint' as ActiveTab,
      title: 'Unidad 1: Vocabulario Técnico (Flashcards)',
      subtitle: 'Programación, Bases de Datos, Web, Git y Scrum',
      guide: 'Voltea tarjetas interactivas con pronunciación en audio. Si fallas una, se guarda para repasarla en 24 horas.',
      doneCount: masteredCards,
      targetCount: Math.min(totalCards, 5),
      icon: <BookOpen className="w-5 h-5" />,
      cta: 'Practicar Flashcards'
    },
    {
      step: 2,
      tab: 'grammar' as ActiveTab,
      subHint: 'grammar_quiz',
      title: 'Unidad 2: Cuestionarios y Completar Oraciones',
      subtitle: 'Voz pasiva técnica, condicionales y modales corteses',
      guide: 'Ejercicios cortos paso a paso con pistas en español y retroalimentación inmediata.',
      doneCount: quizCompleted,
      targetCount: 4,
      icon: <Wrench className="w-5 h-5" />,
      cta: 'Resolver Ejercicios'
    },
    {
      step: 3,
      tab: 'grammar' as ActiveTab,
      subHint: 'incident_writing',
      title: 'Unidad 3: Redacción de Reportes y Code Review',
      subtitle: 'Escribe reportes de fallas (RCA) y comentarios en GitHub',
      guide: 'El validador revisa tu texto y te corrige si usas voz activa o pones "will" después de "if".',
      doneCount: rcaCompleted,
      targetCount: 2,
      icon: <Compass className="w-5 h-5" />,
      cta: 'Practicar Redacción'
    },
    {
      step: 4,
      tab: 'scrum' as ActiveTab,
      title: 'Unidad 4: Reuniones Scrum y Práctica Oral',
      subtitle: 'Daily Standup con micrófono + Audios de equipo',
      guide: 'Sigue la guía Ayer / Hoy / Bloqueos, escucha ejemplos en inglés y graba tu respuesta.',
      doneCount: scrumCompleted,
      targetCount: 2,
      icon: <Mic className="w-5 h-5" />,
      cta: 'Entrar al Standup'
    },
    {
      step: 5,
      tab: 'interview' as ActiveTab,
      title: 'Unidad 5: Simulador de Entrevista Técnica',
      subtitle: 'Preguntas reales de trabajo con temporizador',
      guide: 'Responde preguntas sobre JWT, SQL lento, REST vs GraphQL o Git antes de que termine el reloj.',
      doneCount: interviewCompleted,
      targetCount: 2,
      icon: <Terminal className="w-5 h-5" />,
      cta: 'Simular Entrevista'
    }
  ];

  // Find first incomplete unit for "Continuar donde me quedé"
  const nextUnit = units.find((u) => u.doneCount < u.targetCount) || units[0];
  const totalGoal = units.reduce((acc, u) => acc + u.targetCount, 0);
  const totalDone = units.reduce((acc, u) => acc + Math.min(u.doneCount, u.targetCount), 0);
  const overallPct = Math.round((totalDone / totalGoal) * 100);

  return (
    <div className="space-y-6">
      {/* Banner principal estilo Duolingo: ¿Qué toca hacer hoy? */}
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ide-accentSoft border border-ide-accent/40 text-ide-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ruta Guiada Paso a Paso • {user?.cefr_level} → B2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold">
            Tu camino de aprendizaje en inglés técnico
          </h2>
          <p className="text-sm text-ide-muted leading-relaxed">
            No te preocupes si no sabes por dónde empezar: todas las instrucciones y pistas están en{' '}
            <strong className="text-ide-text">español</strong> y los ejercicios en{' '}
            <strong className="text-ide-text">inglés</strong> te guían paso a paso.
          </p>

          {/* Barra de progreso general */}
          <div className="pt-2 space-y-1.5 max-w-md">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-ide-muted">Progreso de la ruta</span>
              <span className="text-ide-accent font-bold">
                {totalDone} / {totalGoal} metas ({overallPct}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-ide-panel border border-ide-border overflow-hidden">
              <div
                className="h-full bg-ide-accent transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(6, overallPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botón CTA gigante estilo Duolingo */}
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => onNavigate(nextUnit.tab, nextUnit.subHint)}
            className="flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-ide-accent text-ide-bg font-extrabold text-sm border-b-4 border-black/25 hover:brightness-105 active:translate-y-0.5 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continuar: Unidad {nextUnit.step}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-ide-panel border border-ide-border text-xs text-ide-muted hover:text-ide-text"
          >
            <Trophy className="w-3.5 h-3.5 text-ide-warn" />
            <span>Ver mis logros y reporte</span>
          </button>
        </div>
      </div>

      {/* Mapa vertical conectado de unidades */}
      {loading ? (
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-10 text-center text-sm text-ide-muted font-mono">
          Cargando tu ruta personalizada...
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((u) => {
            const isCompleted = u.doneCount >= u.targetCount;
            const isNext = u.step === nextUnit.step && !isCompleted;
            const pct = Math.min(100, Math.round((u.doneCount / u.targetCount) * 100));

            return (
              <div
                key={u.step}
                className={`rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isNext
                    ? 'bg-ide-surface border-ide-accent shadow-lg'
                    : isCompleted
                    ? 'bg-ide-surface border-ide-success/50'
                    : 'bg-ide-surface border-ide-border hover:border-ide-accent/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Círculo numerado de unidad */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold border-b-4 ${
                      isCompleted
                        ? 'bg-ide-success text-ide-bg border-black/20'
                        : isNext
                        ? 'bg-ide-accent text-ide-bg border-black/20'
                        : 'bg-ide-panel text-ide-muted border-ide-border'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : u.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-ide-text">{u.title}</h3>
                      {isNext && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ide-accentSoft text-ide-accent border border-ide-accent/40">
                          RECOMENDADO AHORA
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-ide-success/20 text-ide-success">
                          COMPLETADA
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-ide-accent">{u.subtitle}</p>
                    <p className="text-xs text-ide-muted leading-relaxed max-w-2xl">{u.guide}</p>

                    {/* Mini barra de unidad */}
                    <div className="flex items-center gap-3 pt-1.5">
                      <div className="w-40 h-2 rounded-full bg-ide-panel overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-ide-success' : 'bg-ide-accent'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-ide-muted">
                        {Math.min(u.doneCount, u.targetCount)} / {u.targetCount} completados
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(u.tab, u.subHint)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shrink-0 border-b-2 transition-all ${
                    isNext
                      ? 'bg-ide-accent text-ide-bg border-black/25 hover:brightness-105'
                      : 'bg-ide-panel text-ide-text border-ide-border hover:border-ide-accent'
                  }`}
                >
                  {isCompleted ? 'Repasar Unidad' : u.cta} →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
