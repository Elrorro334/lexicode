import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Headphones, Lightbulb, Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  speakEnglish,
  stopSpeaking
} from '../lib/speech';
import { useAuth } from '../context/AuthContext';
import TrackFilterBar from './TrackFilterBar';
import type { Achievement, ExerciseModule, UserProfile } from '../types';

export default function ScrumSpeechRoom() {
  const { updateUser, notifyAchievements } = useAuth();
  const [mode, setMode] = useState<'standup' | 'sprint_audio'>('standup');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [modules, setModules] = useState<ExerciseModule[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recording, setRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [speechError, setSpeechError] = useState('');
  const [selectedAudioChoice, setSelectedAudioChoice] = useState<number | null>(null);
  const [showAudioScript, setShowAudioScript] = useState(false);
  const [showGuidePhrase, setShowGuidePhrase] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const recRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setResult(null);
    setTranscript('');
    setInterim('');
    setSelectedAudioChoice(null);
    setShowAudioScript(false);
    apiFetch<{ modules: ExerciseModule[] }>(
      `/api/exercises?category=${mode}&track=${encodeURIComponent(selectedTrack)}`
    ).then((res) => {
      setModules(res.modules);
      setSelectedId(res.modules[0]?.id ?? null);
    });
  }, [mode, selectedTrack]);

  useEffect(() => {
    return () => {
      stopAudioMonitoring();
      stopSpeaking();
    };
  }, []);

  const stopAudioMonitoring = () => {
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        // ignore
      }
      recRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setRecording(false);
    setVolumeLevel(0);
  };

  const startRecording = async () => {
    setSpeechError('');
    setResult(null);

    if (!isSpeechRecognitionSupported()) {
      setSpeechError(
        'El micrófono automático requiere Chrome o Edge. Puedes practicar escribiendo o editando tu respuesta en el cuadro de abajo.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round(avg * 1.8)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      const recognition = createSpeechRecognition(
        (finalText, interimText) => {
          setTranscript(finalText);
          setInterim(interimText);
        },
        (err) => setSpeechError(`Error de micrófono/voz: ${err}`),
        () => stopAudioMonitoring()
      );

      if (recognition) {
        recRef.current = recognition;
        recognition.start();
        setRecording(true);
      }
    } catch {
      setSpeechError('No se pudo activar el micrófono. Revisa permisos en tu navegador o escribe tu respuesta abajo.');
    }
  };

  const activeIdx = modules.findIndex((m) => m.id === selectedId);
  const active = activeIdx >= 0 ? modules[activeIdx] : null;

  const goNext = () => {
    if (modules.length === 0) return;
    const nextIdx = activeIdx + 1 < modules.length ? activeIdx + 1 : 0;
    setSelectedId(modules[nextIdx].id);
    setResult(null);
    setTranscript('');
    setInterim('');
    setSelectedAudioChoice(null);
  };

  const verifySpeech = async () => {
    const finalSpoken = `${transcript} ${interim}`.trim();
    if (!active || !finalSpoken) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        score: number;
        isCompleted: boolean;
        feedback: any;
        expectedModel: string;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/exercises/speech-verify', {
        method: 'POST',
        body: JSON.stringify({ moduleId: active.id, transcribedText: finalSpoken })
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

  const submitAudioComprehension = async () => {
    if (!active || selectedAudioChoice === null) return;
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
        body: JSON.stringify({ moduleId: active.id, selectedIndex: selectedAudioChoice })
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

  return (
    <div className="space-y-6">
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">Reuniones Scrum y Práctica Oral (Speech Room)</h2>
          <p className="text-xs text-ide-muted">
            Paso 1: Escucha cómo se pronuncia el modelo. Paso 2: Graba tu voz (o escribe si no tienes micrófono). Paso 3: Supera el 80% de precisión.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-ide-panel border border-ide-border text-xs">
          <button
            onClick={() => setMode('standup')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${
              mode === 'standup' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>1. Hablar (Daily Standup)</span>
          </button>
          <button
            onClick={() => setMode('sprint_audio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold ${
              mode === 'sprint_audio' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>2. Escuchar (Audio Logs)</span>
          </button>
        </div>
      </div>

      <TrackFilterBar selectedTrack={selectedTrack} onSelectTrack={setSelectedTrack} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-4 space-y-2">
          <p className="text-xs font-mono text-ide-muted px-1">Escenarios ({modules.length})</p>
          {modules.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                setResult(null);
                setTranscript('');
                setSelectedAudioChoice(null);
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
                {m.domain_area} • Nivel {m.cefr_level}
              </p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-ide-surface border border-ide-border rounded-2xl p-6 space-y-5">
          {!active ? (
            <div className="py-12 text-center text-sm text-ide-muted">Cargando escenario...</div>
          ) : mode === 'standup' ? (
            <>
              <div className="space-y-2 border-b border-ide-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{active.title}</h3>
                  <button
                    type="button"
                    onClick={() => speakEnglish(active.expected_pattern)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ide-panel border border-ide-border text-xs font-semibold text-ide-accent hover:border-ide-accent"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar ejemplo en inglés</span>
                  </button>
                </div>
                <p className="text-xs text-ide-muted">{active.scenario_context}</p>
                <p className="text-sm font-semibold text-ide-text pt-1">{active.prompt}</p>
              </div>

              {active.parsedOptions && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-ide-panel border border-ide-border">
                    <div className="font-mono text-ide-accent text-[11px] font-bold mb-1">1. AYER (Yesterday)</div>
                    <p className="text-ide-muted">{active.parsedOptions.yesterdayCue}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-ide-panel border border-ide-border">
                    <div className="font-mono text-ide-warn text-[11px] font-bold mb-1">2. HOY (Today)</div>
                    <p className="text-ide-muted">{active.parsedOptions.todayCue}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-ide-panel border border-ide-border">
                    <div className="font-mono text-ide-danger text-[11px] font-bold mb-1">3. BLOQUEOS (Blockers)</div>
                    <p className="text-ide-muted">{active.parsedOptions.blockerCue}</p>
                  </div>
                </div>
              )}

              {/* Guía de lectura en voz alta */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowGuidePhrase((s) => !s)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-ide-warn"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showGuidePhrase ? 'Ocultar frase guía para practicar' : 'Ver frase guía para leer en voz alta'}</span>
                </button>
                {showGuidePhrase && active.spanish_hint && (
                  <div className="p-3 rounded-xl bg-ide-panel border border-ide-warn/30 text-xs text-ide-warn">
                    {active.spanish_hint}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-ide-panel border border-ide-border space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={recording ? stopAudioMonitoring : startRecording}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border-b-2 ${
                      recording
                        ? 'bg-ide-danger text-white border-black/30 animate-pulse'
                        : 'bg-ide-accent text-ide-bg border-black/25 hover:brightness-105'
                    }`}
                  >
                    {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{recording ? 'Detener Micrófono' : 'Grabar Mi Voz'}</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <span className="text-[11px] font-mono text-ide-muted">Volumen:</span>
                    <div className="flex-1 h-2.5 rounded-full bg-ide-surface overflow-hidden">
                      <div
                        className="h-full bg-ide-accent transition-all duration-100"
                        style={{ width: `${volumeLevel}%` }}
                      />
                    </div>
                  </div>
                </div>

                {speechError && <p className="text-xs text-ide-warn">{speechError}</p>}

                <textarea
                  rows={3}
                  value={interim ? `${transcript} ${interim}`.trim() : transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    setInterim('');
                  }}
                  placeholder="Lo que hables aparecerá aquí en inglés (también puedes escribir o corregir manualmente)..."
                  className="w-full p-3 rounded-xl bg-ide-surface border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={submitting || !(transcript || interim).trim()}
                    onClick={verifySpeech}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-success text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Evaluando...' : 'Evaluar Standup'}</span>
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
                      Precisión: {result.score}% {result.isCompleted ? '— ¡Aprobado (>= 80%)!' : '— Intenta superar 80%'}
                    </span>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25"
                    >
                      <span>Siguiente escenario</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p>{result.feedback?.evaluationSummary}</p>
                  <p className="font-mono text-ide-accent">
                    Voz pasiva: {result.feedback?.verbalFluencyMetrics?.detectedPassiveVoice}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1 border-b border-ide-border pb-4">
                <h3 className="text-lg font-bold">{active.title}</h3>
                <p className="text-xs text-ide-muted">{active.scenario_context}</p>
                {active.spanish_hint && (
                  <p className="text-xs text-ide-warn pt-1">Tip de escucha: {active.spanish_hint}</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-ide-panel border border-ide-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakEnglish(active.parsedOptions?.audioScript || '', 0.95)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Escuchar Audio (Normal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => speakEnglish(active.parsedOptions?.audioScript || '', 0.78)}
                    className="px-3 py-2.5 rounded-xl bg-ide-surface border border-ide-border text-xs font-semibold text-ide-muted hover:text-ide-text"
                  >
                    Más lento (0.8x)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAudioScript((s) => !s)}
                  className="text-xs font-semibold text-ide-accent underline"
                >
                  {showAudioScript ? 'Ocultar texto del audio' : 'Ver texto de ayuda'}
                </button>
              </div>

              {showAudioScript && (
                <div className="p-3.5 rounded-xl bg-ide-panel border border-ide-border text-xs font-mono text-ide-muted">
                  {active.parsedOptions?.audioScript}
                </div>
              )}

              <div className="space-y-2.5">
                <p className="text-sm font-bold">{active.parsedOptions?.question}</p>
                {((active.parsedOptions?.choices as string[]) || []).map((c, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-xs cursor-pointer ${
                      selectedAudioChoice === idx
                        ? 'bg-ide-accentSoft border-ide-accent font-semibold'
                        : 'bg-ide-panel border-ide-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="audio-q"
                      checked={selectedAudioChoice === idx}
                      onChange={() => setSelectedAudioChoice(idx)}
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                disabled={submitting || selectedAudioChoice === null}
                onClick={submitAudioComprehension}
                className="px-6 py-3 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
              >
                {submitting ? 'Comprobando...' : 'Comprobar Respuesta'}
              </button>

              {result && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                    result.isCorrect
                      ? 'bg-ide-success/15 border-ide-success/50'
                      : 'bg-ide-warn/15 border-ide-warn/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-sm">Puntaje: {result.score}%</span>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs"
                    >
                      <span>Siguiente audio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p>{result.feedback?.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
