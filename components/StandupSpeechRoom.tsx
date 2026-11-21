'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  ShieldCheck, 
  Award, 
  Play,
  RotateCcw,
  Lightbulb,
  Radio,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  Check,
  AlertTriangle,
  RefreshCw,
  Keyboard
} from 'lucide-react';

interface StandupModule {
  id: number;
  title: string;
  topic: string;
  cefr_level: string;
  prompt: string;
  scenario_context: string;
  expected_pattern: string;
  keywords: string;
  grammar_target: string;
}

interface StandupSpeechRoomProps {
  onStatsUpdate: (stats: any) => void;
}

export default function StandupSpeechRoom({ onStatsUpdate }: StandupSpeechRoomProps) {
  const [standupModules, setStandupModules] = useState<StandupModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<StandupModule | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        const res = await fetch('/api/modules?category=standup');
        const data = await res.json();
        if (data.success && data.modules.length > 0) {
          setStandupModules(data.modules);
          setSelectedModule(data.modules[0]);
        }
      } catch (err) {
        console.error('Failed to load standup modules:', err);
      }
    }
    loadModules();
  }, []);

  // Cleanup audio tracks on unmount
  useEffect(() => {
    return () => {
      stopAudioCapture();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const stopAudioCapture = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setAudioVolume(0);
  };

  // Start real AudioContext to monitor voice decibels and power the live visualizer
  const startAudioCapture = async (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioVolume(Math.min(100, Math.round(avg * 1.5)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('AudioContext volume meter error:', err);
    }
  };

  const startSpeechRecognition = async () => {
    setMicError(null);
    setEvaluationResult(null);

    // 1. First explicitly request getUserMedia for microphone permissions
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      await startAudioCapture(stream);
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Permiso de microfono bloqueado por el navegador. Haz clic en el candado de la barra de direcciones y selecciona "Permitir microfono".');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setMicError('No se encontro ningun microfono conectado a tu equipo.');
      } else {
        setMicError('Error al acceder al microfono: ' + (err.message || err.name));
      }
      setIsRecording(false);
      return;
    }

    // 2. Setup Web Speech API Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      setMicError('Tu navegador no cuenta con soporte nativo para Web Speech API. Puedes escribir directamente en el cuadro de texto o usar el boton de respuesta recomendada.');
      setIsRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setMicError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicError('Permiso del microfono denegado. Permite el acceso al microfono en la barra de URL.');
          stopAudioCapture();
          setIsRecording(false);
        } else if (event.error === 'network') {
          setMicError('El servicio de voz del navegador no pudo conectarse (comun si usas Brave o bloqueadores de red). Puedes escribir tu respuesta o usar el modelo de ejemplo.');
          // Don't kill audio capture, user can still speak or write
        } else if (event.error === 'no-speech') {
          // Normal pause in speech, do not abort
        }
      };

      recognition.onend = () => {
        // Only stop if user explicitly stopped
        if (!recognitionRef.current?._shouldBeRunning) {
          setIsRecording(false);
          setInterimTranscript('');
          stopAudioCapture();
        } else {
          // Restart if still intended to run
          try {
            recognition.start();
          } catch (_) {}
        }
      };

      recognition._shouldBeRunning = true;
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      setMicError('Error al inicializar reconocimiento de voz: ' + err.message);
      setIsRecording(false);
      stopAudioCapture();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current._shouldBeRunning = false;
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    stopAudioCapture();
    setIsRecording(false);
    setInterimTranscript('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const playNativePronunciation = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && selectedModule) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedModule.expected_pattern);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeakingTTS(true);
      utterance.onend = () => setIsSpeakingTTS(false);
      utterance.onerror = () => setIsSpeakingTTS(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVerifySpeech = async () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText || !selectedModule) return;

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/speech/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          transcribedText: fullText,
          targetPattern: selectedModule.expected_pattern,
          keywords: selectedModule.keywords
        })
      });

      const data = await res.json();
      if (data.success) {
        setEvaluationResult(data);
        if (data.userStats) {
          onStatsUpdate(data.userStats);
        }

        if (data.isCompleted) {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err) {
      console.error('Speech verification failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSimulateSampleSpeech = () => {
    if (selectedModule) {
      setTranscript(selectedModule.expected_pattern);
      setInterimTranscript('');
      setEvaluationResult(null);
      setMicError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Friendly Warm Hero Banner with Motion */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-emerald-950/70 via-zinc-900 to-zinc-900 border border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Historia de Usuario 2 - Rodrigo Sanchez Cruz (Backend Lead)
            </span>
            <span className="text-xs text-zinc-400">Web Speech API & AudioContext</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Mic className="w-7 h-7 text-emerald-400" />
            <span>Simulador de Standup y Practica Oral</span>
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Habla con seguridad y elimina la friccion en tus <strong className="text-white">Daily Standups</strong> en ingles. 
            Graba tu explicacion oral de bugs e incidentes tecnicos con retroalimentacion fonetica y sintactica instantanea.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTips(!showTips)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-200 transition font-medium cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{showTips ? 'Ocultar guia rapida' : 'Como funciona esta practica?'}</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showTips && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 rounded-2xl bg-zinc-800/80 border border-emerald-800/40 text-xs text-zinc-300 space-y-2 overflow-hidden"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Guia de exito para tu Standup:
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-300">
                  <li>Selecciona el escenario tecnico de la izquierda (ej. fuga de memoria o migracion de tablas).</li>
                  <li>Presiona "Escuchar Modelo Nativo" para afinar tu oido con la pronunciacion correcta.</li>
                  <li>Presiona el microfono y habla en ingles. Puedes hablar a tu ritmo.</li>
                  <li>Si alcanzas una precision igual o mayor al 80%, el sistema completa la tarea y registra tu progreso exitosamente.</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Friendly Scenario Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Selecciona tu Escenario de Hoy
            </h3>
            <span className="text-[11px] text-zinc-400 font-medium">3 situaciones reales</span>
          </div>

          <div className="space-y-2.5">
            {standupModules.map((mod) => (
              <motion.div
                key={mod.id}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  setSelectedModule(mod);
                  setTranscript('');
                  setInterimTranscript('');
                  setEvaluationResult(null);
                  setMicError(null);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  selectedModule?.id === mod.id
                    ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/30 border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    Nivel {mod.cefr_level}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium truncate">
                    {mod.topic}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-2">
                  {mod.title}
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {mod.scenario_context}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Audio Studio */}
        <div className="lg:col-span-8 space-y-4">
          {selectedModule && (
            <motion.div 
              layout
              className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
            >
              {/* Scenario Context Card */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Situacion Practica
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {selectedModule.title}
                    </h3>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={playNativePronunciation}
                    disabled={isSpeakingTTS}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer shadow-sm"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeakingTTS ? 'animate-bounce text-emerald-200' : ''}`} />
                    <span>{isSpeakingTTS ? 'Reproduciendo audio...' : 'Escuchar Modelo Nativo'}</span>
                  </motion.button>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    <strong className="text-emerald-400 font-semibold">Tu mision en el standup: </strong>
                    {selectedModule.prompt}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                    <span className="text-zinc-400 font-medium">Estructura Gramatical:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                      {selectedModule.grammar_target}
                    </span>
                    <span className="text-zinc-400 font-medium ml-2">Palabras clave:</span>
                    {selectedModule.keywords.split(',').slice(0, 3).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recording Studio & Diagnostic */}
              <div className="bg-gradient-to-b from-zinc-950/80 to-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-5">
                {/* Audio Wave Visualizer reacting to REAL audio amplitude */}
                {isRecording ? (
                  <div className="flex items-center justify-center gap-1.5 h-12">
                    {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
                      const dynamicHeight = Math.max(6, Math.min(38, Math.round((audioVolume / 100) * 38 * (1 + (bar % 3) * 0.2))));
                      return (
                        <motion.span 
                          key={bar}
                          animate={{ height: `${dynamicHeight}px` }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Haz clic en el microfono cuando estes listo para hablar</span>
                  </div>
                )}

                {/* Big Animated Microphone Button */}
                <div className="flex justify-center relative">
                  {isRecording && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl bg-emerald-500/25 -m-1 pointer-events-none"
                    />
                  )}
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={toggleRecording}
                    className={`relative w-22 h-22 rounded-3xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                      isRecording
                        ? 'bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-rose-600/40 ring-4 ring-rose-500/30'
                        : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white shadow-emerald-600/30 hover:shadow-emerald-600/50'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-9 h-9 animate-pulse" />
                    ) : (
                      <Mic className="w-9 h-9" />
                    )}
                  </motion.button>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">
                    {isRecording ? 'Te escuchamos. Habla a tu ritmo...' : 'Grabar Explicacion Oral'}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    {isRecording 
                      ? 'Presiona el boton nuevamente cuando concluyas tu intervencion.' 
                      : 'El motor del navegador transcribira cada palabra en vivo sin requerir tokens de terceros.'}
                  </p>
                </div>

                {/* Microphone Error Banner with helpful troubleshooting */}
                <AnimatePresence>
                  {micError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-left text-xs text-amber-200 space-y-2"
                    >
                      <div className="font-bold flex items-center gap-2 text-amber-300">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Aviso del Microfono</span>
                      </div>
                      <p>{micError}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={startSpeechRecognition}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold flex items-center gap-1.5 hover:bg-amber-500 transition cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reintentar Permiso</span>
                        </button>
                        <button
                          onClick={handleSimulateSampleSpeech}
                          className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 font-semibold flex items-center gap-1.5 hover:bg-zinc-700 transition cursor-pointer"
                        >
                          <Keyboard className="w-3.5 h-3.5" />
                          <span>Escribir / Usar Respuesta de Ejemplo</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Live Transcript Box (Also allows direct typing/editing) */}
                <div className="text-left bg-zinc-950 border border-zinc-800 rounded-2xl p-4 min-h-[100px] space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <span className="flex items-center gap-2 font-semibold">
                      <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
                      <span>Transcripcion de Voz (Editable):</span>
                    </span>
                    {transcript && (
                      <button
                        onClick={() => { setTranscript(''); setInterimTranscript(''); setEvaluationResult(null); }}
                        className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>

                  <textarea
                    value={transcript + (interimTranscript ? ' ' + interimTranscript : '')}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Las palabras que pronuncies apareceran aqui en tiempo real. Tambien puedes escribir o corregir manualmente si lo deseas..."
                    rows={3}
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSimulateSampleSpeech}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4 transition cursor-pointer"
                  >
                    Usar respuesta de ejemplo (Probar rapido)
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleVerifySpeech}
                    disabled={isEvaluating || (!transcript.trim() && !interimTranscript.trim())}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluando pronunciacion...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Evaluar Pronunciacion (Meta &gt;= 80%)</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Feedback and Encouraging Results */}
              <AnimatePresence>
                {evaluationResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-6 rounded-3xl border space-y-4 shadow-lg ${
                      evaluationResult.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-600/40 shadow-emerald-950/30'
                        : 'bg-amber-950/20 border-amber-600/40 shadow-amber-950/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          evaluationResult.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {evaluationResult.isCompleted ? (
                            <CheckCircle2 className="w-7 h-7" />
                          ) : (
                            <AlertCircle className="w-7 h-7" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-base">
                            {evaluationResult.isCompleted 
                              ? 'Excelente. Tarea Aprobada y Guardada' 
                              : 'Buen intento, afinemos algunos detalles'}
                          </h4>
                          <p className="text-xs text-zinc-300 mt-0.5">
                            {evaluationResult.feedback.evaluationSummary}
                          </p>
                        </div>
                      </div>

                      <div className="bg-zinc-900/90 px-4 py-2 rounded-2xl border border-zinc-800 text-center">
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Precision</div>
                        <div className={`text-2xl font-black font-mono ${
                          evaluationResult.score >= 80 ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {evaluationResult.score}%
                        </div>
                      </div>
                    </div>

                    {/* Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
                        <span className="text-zinc-400 font-semibold text-[11px]">
                          Uso de Voz Pasiva Tecnica:
                        </span>
                        <p className="text-zinc-200 font-medium">
                          {evaluationResult.feedback.verbalFluencyMetrics.detectedPassiveVoice}
                        </p>
                      </div>

                      <div className="bg-zinc-900/70 p-3.5 rounded-2xl border border-zinc-800 space-y-1">
                        <span className="text-zinc-400 font-semibold text-[11px]">
                          Persistencia en Base de Datos:
                        </span>
                        <p className="text-emerald-400 font-mono text-[11px]">
                          Guardado en tabla ExerciseScores (id #{evaluationResult.userStats?.merged_prs || 1})
                        </p>
                      </div>
                    </div>

                    {/* Matched Keywords */}
                    <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-800 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-zinc-400 font-medium">Terminos dominados en este intento:</span>
                      {evaluationResult.feedback.matchedKeywords.length > 0 ? (
                        evaluationResult.feedback.matchedKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{kw}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 italic">Ningun termino clave detectado</span>
                      )}
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
