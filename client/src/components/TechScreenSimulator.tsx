import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
  Terminal,
  Volume2
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { createSpeechRecognition, isSpeechRecognitionSupported, speakEnglish } from '../lib/speech';
import { useAuth } from '../context/AuthContext';
import TrackFilterBar from './TrackFilterBar';
import type { Achievement, ExerciseModule, UserProfile } from '../types';

const STARTER_PHRASES = [
  'First, I would...',
  'Whereas REST uses..., GraphQL...',
  'If health checks fail, the pipeline will...',
  'The request is verified by...'
];

export default function TechScreenSimulator() {
  const { updateUser, notifyAchievements } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [modules, setModules] = useState<ExerciseModule[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const recRef = useRef<any>(null);

  useEffect(() => {
    apiFetch<{ modules: ExerciseModule[] }>(
      `/api/exercises?category=interview&track=${encodeURIComponent(selectedTrack)}`
    ).then((res) => {
      setModules(res.modules);
      if (res.modules[0]) {
        setSelectedId(res.modules[0].id);
        setSecondsLeft(res.modules[0].time_limit_sec || 90);
      } else {
        setSelectedId(null);
      }
    });
  }, [selectedTrack]);

  const activeIdx = modules.findIndex((m) => m.id === selectedId);
  const active = activeIdx >= 0 ? modules[activeIdx] : null;

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const selectInterview = (m: ExerciseModule) => {
    setSelectedId(m.id);
    setSecondsLeft(m.time_limit_sec || 90);
    setTimerRunning(false);
    setResponseText('');
    setResult(null);
  };

  const goNext = () => {
    if (modules.length === 0) return;
    const nextIdx = activeIdx + 1 < modules.length ? activeIdx + 1 : 0;
    selectInterview(modules[nextIdx]);
  };

  const toggleVoice = () => {
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!isSpeechRecognitionSupported()) return;
    const rec = createSpeechRecognition(
      (finalT, interimT) => setResponseText(`${finalT} ${interimT}`.trim()),
      () => setRecording(false),
      () => setRecording(false)
    );
    if (rec) {
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setTimerRunning(true);
    }
  };

  const submitAnswer = async () => {
    if (!active || !responseText.trim()) return;
    setTimerRunning(false);
    if (recording) {
      recRef.current?.stop();
      setRecording(false);
    }
    setSubmitting(true);
    const totalLimit = active.time_limit_sec || 90;
    const durationSec = Math.max(5, totalLimit - secondsLeft);

    try {
      const res = await apiFetch<{
        score: number;
        isCompleted: boolean;
        feedback: any;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/exercises/interview', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: active.id,
          responseText,
          durationSec
        })
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

  const totalSec = active?.time_limit_sec || 90;
  const pct = Math.round((secondsLeft / totalSec) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-bold">Simulador de Entrevista Técnica (Tech Screen)</h2>
          </div>
          <p className="text-xs text-ide-muted">
            Paso 1: Lee la pregunta en inglés y su traducción al español. Paso 2: Responde con tu voz o escribiendo antes de que acabe el reloj.
          </p>
        </div>

        {active && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <div
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                secondsLeft <= 20
                  ? 'bg-ide-danger/15 border-ide-danger text-ide-danger'
                  : 'bg-ide-panel border-ide-border text-ide-accent'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">{secondsLeft}s</span>
            </div>
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className="p-2.5 rounded-xl bg-ide-panel border border-ide-border text-ide-text hover:border-ide-accent"
              title={timerRunning ? 'Pausar reloj' : 'Iniciar reloj'}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setSecondsLeft(totalSec);
              }}
              className="p-2.5 rounded-xl bg-ide-panel border border-ide-border text-ide-muted hover:text-ide-text"
              title="Reiniciar reloj"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <TrackFilterBar selectedTrack={selectedTrack} onSelectTrack={setSelectedTrack} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4 space-y-2">
          <p className="text-xs font-mono text-ide-muted px-1">Preguntas de Entrevista ({modules.length})</p>
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => selectInterview(m)}
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
                {m.domain_area} • {m.time_limit_sec}s
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-ide-surface border border-ide-border rounded-2xl p-6 space-y-4">
          {!active ? (
            <div className="py-12 text-center text-sm text-ide-muted">Cargando preguntas...</div>
          ) : (
            <>
              <div className="w-full h-2 rounded-full bg-ide-panel overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    secondsLeft <= 20 ? 'bg-ide-danger' : 'bg-ide-accent'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="p-4 rounded-xl bg-ide-panel border border-ide-border space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-ide-accent">
                    Entrevistador: {active.parsedOptions?.interviewerPersona || 'Engineering Manager'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      speakEnglish(active.prompt);
                      setTimerRunning(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ide-surface border border-ide-border text-xs font-semibold text-ide-accent"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Escuchar en inglés</span>
                  </button>
                </div>

                <h3 className="text-base font-bold pt-1 text-ide-text">{active.prompt}</h3>

                {active.parsedOptions?.promptEs && (
                  <p className="text-xs text-ide-accent">
                    <strong>En español:</strong> {active.parsedOptions.promptEs}
                  </p>
                )}

                {active.spanish_hint && (
                  <p className="text-xs text-ide-warn flex items-start gap-1.5 pt-1">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Qué incluir: {active.spanish_hint}</span>
                  </p>
                )}
              </div>

              {/* Frases de inicio tipo Duolingo para no quedarse en blanco */}
              <div className="space-y-1.5">
                <span className="text-xs text-ide-muted">Frases iniciales útiles (clic para usar):</span>
                <div className="flex flex-wrap gap-1.5">
                  {STARTER_PHRASES.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() =>
                        setResponseText((prev) => (prev ? `${prev} ${phrase}` : phrase))
                      }
                      className="px-2.5 py-1 rounded-lg bg-ide-panel border border-ide-border text-[11px] font-mono text-ide-accent hover:border-ide-accent"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ide-muted">Tu respuesta en inglés:</span>
                  {isSpeechRecognitionSupported() && (
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                        recording
                          ? 'bg-ide-danger text-white animate-pulse'
                          : 'bg-ide-panel border border-ide-border text-ide-accent'
                      }`}
                    >
                      {recording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      <span>{recording ? 'Detener Voz' : 'Responder Hablando'}</span>
                    </button>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={responseText}
                  onChange={(e) => {
                    setResponseText(e.target.value);
                    if (!timerRunning && secondsLeft === totalSec) setTimerRunning(true);
                  }}
                  placeholder="Escribe o dicta tu explicación técnica en inglés..."
                  className="w-full p-4 rounded-xl bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={submitting || !responseText.trim()}
                    onClick={submitAnswer}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Evaluando entrevista...' : 'Enviar Respuesta'}</span>
                  </button>
                </div>
              </div>

              {result && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                    result.isCompleted
                      ? 'bg-ide-success/15 border-ide-success/50'
                      : 'bg-ide-warn/15 border-ide-warn/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-sm">
                      Puntaje: {result.score}% • Tiempo: {result.feedback?.durationSec}s
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs"
                    >
                      <span>Siguiente pregunta</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p>{result.feedback?.summary}</p>
                  {result.feedback?.matchedKeywords?.length > 0 && (
                    <p className="text-ide-success font-mono">
                      Conceptos acertados: {result.feedback.matchedKeywords.join(', ')}
                    </p>
                  )}
                  <div className="p-3 rounded-xl bg-ide-panel border border-ide-border font-mono text-ide-accent">
                    Respuesta ideal (Nivel B2): {result.feedback?.sampleAnswer}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
