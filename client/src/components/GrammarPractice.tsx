import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  HelpCircle,
  Lightbulb,
  PenTool,
  Send
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TrackFilterBar from './TrackFilterBar';
import type { Achievement, ExerciseModule, UserProfile } from '../types';

export type GrammarSubMode = 'grammar_quiz' | 'fill_blank' | 'incident_writing';

interface GrammarPracticeProps {
  initialSubMode?: GrammarSubMode;
}

export default function GrammarPractice({ initialSubMode }: GrammarPracticeProps) {
  const { updateUser, notifyAchievements } = useAuth();
  const [subMode, setSubMode] = useState<GrammarSubMode>(initialSubMode || 'grammar_quiz');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [modules, setModules] = useState<ExerciseModule[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [blankAnswer, setBlankAnswer] = useState('');
  const [rcaText, setRcaText] = useState('');

  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialSubMode) setSubMode(initialSubMode);
  }, [initialSubMode]);

  const loadModules = async (cat: GrammarSubMode, trackFilter = selectedTrack) => {
    setLoading(true);
    setResult(null);
    setSelectedChoice(null);
    setBlankAnswer('');
    setRcaText('');
    try {
      const res = await apiFetch<{ modules: ExerciseModule[] }>(
        `/api/exercises?category=${cat}&track=${encodeURIComponent(trackFilter)}`
      );
      setModules(res.modules);
      setSelectedId(res.modules[0]?.id ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules(subMode, selectedTrack);
  }, [subMode, selectedTrack]);

  const activeIdx = modules.findIndex((m) => m.id === selectedId);
  const active = activeIdx >= 0 ? modules[activeIdx] : null;
  const progressPct = modules.length > 0 && activeIdx >= 0 ? Math.round(((activeIdx + 1) / modules.length) * 100) : 0;

  const goNextExercise = () => {
    if (modules.length === 0) return;
    const nextIdx = activeIdx + 1 < modules.length ? activeIdx + 1 : 0;
    setSelectedId(modules[nextIdx].id);
    setResult(null);
    setSelectedChoice(null);
    setBlankAnswer('');
    setRcaText('');
  };

  const submitQuiz = async () => {
    if (!active || selectedChoice === null) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        score: number;
        isCorrect: boolean;
        feedback: any;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/exercises/quiz', {
        method: 'POST',
        body: JSON.stringify({ moduleId: active.id, selectedIndex: selectedChoice })
      });
      setResult(res);
      updateUser(res.user);
      notifyAchievements(res.newlyUnlocked);
      if (res.isCorrect) {
        setModules((prev) => prev.map((m) => (m.id === active.id ? { ...m, completed_by_user: 1 } : m)));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitFillBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !blankAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        score: number;
        isCorrect: boolean;
        feedback: any;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/exercises/fill-blank', {
        method: 'POST',
        body: JSON.stringify({ moduleId: active.id, answer: blankAnswer })
      });
      setResult(res);
      updateUser(res.user);
      notifyAchievements(res.newlyUnlocked);
      if (res.isCorrect) {
        setModules((prev) => prev.map((m) => (m.id === active.id ? { ...m, completed_by_user: 1 } : m)));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitIncidentGrammar = async () => {
    if (!active || !rcaText.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        score: number;
        isCompleted: boolean;
        flags: Array<{ type: string; detected: string; suggestion: string; explanation: string }>;
        summary: string;
        expectedModel: string;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/exercises/grammar-validate', {
        method: 'POST',
        body: JSON.stringify({ moduleId: active.id, textInput: rcaText })
      });
      setResult(res);
      updateUser(res.user);
      notifyAchievements(res.newlyUnlocked);
      if (res.isCompleted) {
        setModules((prev) => prev.map((m) => (m.id === active.id ? { ...m, completed_by_user: 1 } : m)));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modeDescriptions: Record<GrammarSubMode, string> = {
    grammar_quiz: 'Lee la pregunta en español y elige la opción que usa la gramática correcta en inglés.',
    fill_blank: 'Completa el espacio en blanco escribiendo o tocando una de las fichas sugeridas.',
    incident_writing: 'Escribe un reporte técnico o comentario de Code Review en inglés; el sistema revisa tus errores al instante.'
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y pestañas claras en español */}
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Ejercicios de Inglés Técnico y Gramática</h2>
          <p className="text-xs text-ide-muted">{modeDescriptions[subMode]}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-ide-panel border border-ide-border text-xs">
          <button
            onClick={() => setSubMode('grammar_quiz')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${
              subMode === 'grammar_quiz' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>1. Cuestionarios</span>
          </button>
          <button
            onClick={() => setSubMode('fill_blank')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${
              subMode === 'fill_blank' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>2. Completar Oraciones</span>
          </button>
          <button
            onClick={() => setSubMode('incident_writing')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${
              subMode === 'incident_writing' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <FileWarning className="w-3.5 h-3.5" />
            <span>3. Redacción (RCA / PR)</span>
          </button>
        </div>
      </div>

      <TrackFilterBar selectedTrack={selectedTrack} onSelectTrack={setSelectedTrack} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de ejercicios */}
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4 space-y-2">
          <p className="text-xs font-mono text-ide-muted px-1 pb-1">Lecciones ({modules.length})</p>
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                setResult(null);
                setSelectedChoice(null);
                setBlankAnswer('');
                setRcaText('');
              }}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                selectedId === m.id
                  ? 'bg-ide-accentSoft border-ide-accent'
                  : 'bg-ide-panel border-ide-border hover:border-ide-accent/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate">
                  {idx + 1}. {m.title}
                </span>
                {m.completed_by_user === 1 && <CheckCircle2 className="w-4 h-4 text-ide-success shrink-0" />}
              </div>
              <p className="text-[11px] text-ide-muted mt-0.5">
                {m.grammar_target} • Nivel {m.cefr_level}
              </p>
            </button>
          ))}
        </div>

        {/* Área interactiva del ejercicio */}
        <div className="lg:col-span-2 bg-ide-surface border border-ide-border rounded-2xl p-6 space-y-5">
          {loading || !active ? (
            <div className="py-12 text-center text-sm text-ide-muted">Cargando ejercicio...</div>
          ) : (
            <>
              {/* Barra de progreso paso a paso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-ide-accent font-bold">
                    Ejercicio {activeIdx + 1} de {modules.length}
                  </span>
                  <span className="text-ide-muted">{active.grammar_target}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-ide-panel overflow-hidden">
                  <div
                    className="h-full bg-ide-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Instrucción clara en español */}
              <div className="p-4 rounded-xl bg-ide-panel border border-ide-border space-y-1.5">
                <h3 className="text-base font-bold">{active.title}</h3>
                <p className="text-xs text-ide-muted">
                  <strong>Situación:</strong> {active.scenario_context}
                </p>
                <p className="text-sm font-semibold text-ide-text pt-1">{active.prompt}</p>
                {active.spanish_hint && (
                  <p className="text-xs text-ide-warn flex items-center gap-1.5 pt-1">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Pista: {active.spanish_hint}</span>
                  </p>
                )}
              </div>

              {/* MODO 1: CUESTIONARIO */}
              {subMode === 'grammar_quiz' && active.parsedOptions && (
                <div className="space-y-4">
                  <p className="text-sm font-bold">{active.parsedOptions.question}</p>
                  <div className="space-y-2.5">
                    {(active.parsedOptions.choices as string[]).map((choice, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-xs cursor-pointer transition-all ${
                          selectedChoice === idx
                            ? 'bg-ide-accentSoft border-ide-accent text-ide-text font-semibold'
                            : 'bg-ide-panel border-ide-border text-ide-muted hover:text-ide-text'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quiz-opt"
                          checked={selectedChoice === idx}
                          onChange={() => setSelectedChoice(idx)}
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    disabled={submitting || selectedChoice === null}
                    onClick={submitQuiz}
                    className="px-6 py-3 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                  >
                    {submitting ? 'Revisando...' : 'Comprobar Respuesta'}
                  </button>
                </div>
              )}

              {/* MODO 2: COMPLETAR ORACIONES (CON FICHAS ESTILO DUOLINGO) */}
              {subMode === 'fill_blank' && active.parsedOptions && (
                <form onSubmit={submitFillBlank} className="space-y-4">
                  <div className="p-5 rounded-xl bg-ide-panel border border-ide-border text-sm leading-loose">
                    <span>{active.parsedOptions.sentenceBefore} </span>
                    <input
                      type="text"
                      value={blankAnswer}
                      onChange={(e) => setBlankAnswer(e.target.value)}
                      placeholder={active.parsedOptions.hintVerb}
                      className="inline-block w-48 mx-1 px-3 py-1 rounded-xl bg-ide-surface border-2 border-ide-accent font-mono text-xs text-ide-accent focus:outline-none"
                    />
                    <span> {active.parsedOptions.sentenceAfter}</span>
                  </div>

                  {Array.isArray(active.parsedOptions.chips) && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-ide-muted">Elige una ficha o escríbela:</span>
                      {(active.parsedOptions.chips as string[]).map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setBlankAnswer(chip)}
                          className={`px-3 py-1.5 rounded-xl border border-b-2 font-mono text-xs transition-all ${
                            blankAnswer === chip
                              ? 'bg-ide-accent text-ide-bg border-black/25 font-bold'
                              : 'bg-ide-panel border-ide-border text-ide-text hover:border-ide-accent'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !blankAnswer.trim()}
                    className="px-6 py-3 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                  >
                    {submitting ? 'Revisando...' : 'Comprobar Oración'}
                  </button>
                </form>
              )}

              {/* MODO 3: REDACCIÓN GUIADA RCA / PR */}
              {subMode === 'incident_writing' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() =>
                        setRcaText(
                          'We noticed a memory leak and we restarted the server. If the gateway will fail, we fix it.'
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-warn hover:border-ide-warn"
                    >
                      Probar texto con errores comunes
                    </button>
                    <button
                      type="button"
                      onClick={() => setRcaText(active.expected_pattern)}
                      className="px-3 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-success hover:border-ide-success"
                    >
                      Ver y probar ejemplo B2 correcto
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={rcaText}
                    onChange={(e) => setRcaText(e.target.value)}
                    placeholder="Escribe aquí tu reporte o comentario de PR en inglés..."
                    className="w-full p-4 rounded-xl bg-ide-panel border border-ide-border font-mono text-xs focus:outline-none focus:border-ide-accent"
                  />
                  <button
                    type="button"
                    disabled={submitting || !rcaText.trim()}
                    onClick={submitIncidentGrammar}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Analizando tu texto...' : 'Validar Gramática'}</span>
                  </button>
                </div>
              )}

              {/* Resultado con explicación en español */}
              {result && (
                <div className="space-y-3 pt-2">
                  <div
                    className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                      result.isCorrect || result.isCompleted
                        ? 'bg-ide-success/15 border-ide-success/50'
                        : 'bg-ide-warn/15 border-ide-warn/50'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-sm">
                        {result.isCorrect || result.isCompleted
                          ? `¡Muy bien! (+1 PR) • ${result.score}%`
                          : `Revisa esta regla • ${result.score}%`}
                      </span>
                      <button
                        type="button"
                        onClick={goNextExercise}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25"
                      >
                        <span>Siguiente ejercicio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {result.feedback?.explanation && <p>{result.feedback.explanation}</p>}
                    {result.feedback?.acceptedAnswers && (
                      <p className="font-mono text-ide-accent">
                        Respuestas aceptadas: {result.feedback.acceptedAnswers.join(' / ')}
                      </p>
                    )}
                    {result.summary && <p>{result.summary}</p>}
                    {result.expectedModel && (
                      <p className="font-mono text-ide-accent pt-1">
                        Ejemplo correcto: {result.expectedModel}
                      </p>
                    )}
                  </div>

                  {Array.isArray(result.flags) && result.flags.length > 0 && (
                    <div className="space-y-2">
                      {result.flags.map((flag: any, i: number) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-xl bg-ide-panel border border-ide-danger/40 text-xs space-y-1"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-ide-danger">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Detectado: "{flag.detected}"</span>
                          </div>
                          <p className="text-ide-success font-mono">Sugerencia: {flag.suggestion}</p>
                          <p className="text-ide-muted">{flag.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
