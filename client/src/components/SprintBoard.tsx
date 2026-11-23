import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Play,
  RotateCw,
  Send,
  Volume2,
  XCircle
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { speakEnglish } from '../lib/speech';
import { useAuth } from '../context/AuthContext';
import type { Achievement, UserProfile, VocabCard } from '../types';

const DOMAIN_OPTIONS = [
  { key: 'All', label: 'Todos los temas' },
  { key: 'Programming', label: 'Programación' },
  { key: 'Databases', label: 'Bases de Datos' },
  { key: 'Web Development', label: 'Desarrollo Web' },
  { key: 'Git & Version Control', label: 'Git y Versiones' },
  { key: 'Agile & Scrum', label: 'Scrum / Ágil' },
  { key: 'DevOps', label: 'DevOps' }
];

export default function SprintBoard() {
  const { updateUser, notifyAchievements } = useAuth();
  const [domain, setDomain] = useState('All');
  const [overdueCount, setOverdueCount] = useState(0);
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [activeQueue, setActiveQueue] = useState<VocabCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'flashcard' | 'written'>('flashcard');
  const [writtenInput, setWrittenInput] = useState('');
  const [showSpanishHint, setShowSpanishHint] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSprint = async (selectedDomain = domain) => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        overdueCount: number;
        sprintItems: VocabCard[];
        allCards: VocabCard[];
      }>(`/api/sprint?domain=${encodeURIComponent(selectedDomain)}`);
      setOverdueCount(res.overdueCount);
      setCards(res.allCards);
      setActiveQueue(selectedDomain === 'All' ? res.sprintItems : res.allCards);
      setCurrentIdx(0);
      setFlipped(false);
      setFeedback(null);
      setWrittenInput('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprint(domain);
  }, [domain]);

  const currentCard = activeQueue[currentIdx] || null;
  const parsedMeta = currentCard?.options_json ? JSON.parse(currentCard.options_json) : {};
  const keywordChips = (currentCard?.keywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const submitReview = async (payload: { mode: 'flashcard' | 'written'; known?: boolean; userResponse?: string }) => {
    if (!currentCard) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        score: number;
        isCorrect: boolean;
        feedback: any;
        user: UserProfile;
        newlyUnlocked?: Achievement[];
      }>('/api/sprint/review', {
        method: 'POST',
        body: JSON.stringify({
          moduleId: currentCard.id,
          ...payload
        })
      });
      setFeedback(res);
      updateUser(res.user);
      notifyAchievements(res.newlyUnlocked);
      setCards((prev) =>
        prev.map((c) =>
          c.id === currentCard.id
            ? {
                ...c,
                is_overdue: 0,
                repetitions: res.isCorrect ? c.repetitions + 1 : 0,
                last_result: res.isCorrect ? 1 : 0
              }
            : c
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextCard = () => {
    setFlipped(false);
    setFeedback(null);
    setWrittenInput('');
    setCurrentIdx((prev) => (prev + 1 < activeQueue.length ? prev + 1 : 0));
  };

  const overdueCards = cards.filter((c) => c.is_overdue === 1);
  const masteredCards = cards.filter((c) => c.repetitions >= 1 && c.is_overdue === 0);
  const progressPct = activeQueue.length > 0 ? Math.round(((currentIdx + 1) / activeQueue.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Encabezado y guía */}
      <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-bold">Vocabulario Técnico con Flashcards (Repetición Espaciada)</h2>
          </div>
          <p className="text-xs text-ide-muted">
            Paso 1: Lee el término y escucha la pronunciación. Paso 2: Voltea la tarjeta para ver el significado en español y un ejemplo real. Paso 3: Indica si la recordaste.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-ide-panel border border-ide-border text-xs font-mono">
            <span className="text-ide-warn font-bold">{overdueCount}</span>{' '}
            <span className="text-ide-muted">por repasar</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-ide-panel border border-ide-border text-xs font-mono">
            <span className="text-ide-success font-bold">{masteredCards.length}</span>{' '}
            <span className="text-ide-muted">dominadas</span>
          </div>
          <button
            onClick={() => {
              setDomain('All');
              loadSprint('All');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 hover:brightness-105"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Sprint Diario (10)</span>
          </button>
        </div>
      </div>

      {/* Filtros por tema en español */}
      <div className="flex flex-wrap gap-2">
        {DOMAIN_OPTIONS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDomain(d.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              domain === d.key
                ? 'bg-ide-accentSoft border-ide-accent text-ide-accent'
                : 'bg-ide-surface border-ide-border text-ide-muted hover:text-ide-text'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área principal de práctica */}
        <div className="lg:col-span-2 bg-ide-surface border border-ide-border rounded-2xl p-6 space-y-5">
          {loading ? (
            <div className="py-16 text-center text-sm text-ide-muted font-mono">
              Cargando tarjetas desde Microsoft SQL Server...
            </div>
          ) : !currentCard ? (
            <div className="py-16 text-center text-sm text-ide-muted">
              No hay tarjetas disponibles para este tema.
            </div>
          ) : (
            <>
              {/* Barra de progreso de sesión estilo Duolingo */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-ide-accent font-mono">
                    Tarjeta {currentIdx + 1} de {activeQueue.length}
                  </span>
                  <div className="flex p-0.5 rounded-xl bg-ide-panel border border-ide-border text-xs">
                    <button
                      onClick={() => {
                        setPracticeMode('flashcard');
                        setFeedback(null);
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        practiceMode === 'flashcard' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted'
                      }`}
                    >
                      Modo Tarjeta (Voltear)
                    </button>
                    <button
                      onClick={() => {
                        setPracticeMode('written');
                        setFlipped(false);
                        setFeedback(null);
                      }}
                      className={`px-3 py-1 rounded-lg font-semibold ${
                        practiceMode === 'written' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted'
                      }`}
                    >
                      Modo Escritura
                    </button>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-ide-panel overflow-hidden">
                  <div
                    className="h-full bg-ide-accent transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {practiceMode === 'flashcard' ? (
                <div className="space-y-4">
                  <div
                    onClick={() => setFlipped((f) => !f)}
                    className="perspective-1000 cursor-pointer select-none"
                  >
                    <div
                      className={`relative min-h-[270px] transition-transform duration-500 preserve-3d ${
                        flipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Frente */}
                      <div className="absolute inset-0 backface-hidden rounded-2xl bg-ide-panel border border-ide-border p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-ide-muted">
                            FRENTE • Haz clic en la tarjeta para voltearla
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakEnglish(parsedMeta.term || currentCard.title);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ide-surface border border-ide-border text-xs font-semibold text-ide-accent hover:border-ide-accent"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Escuchar</span>
                          </button>
                        </div>

                        <div className="text-center space-y-2 my-auto">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-ide-surface border border-ide-border text-[11px] font-mono text-ide-warn">
                            {currentCard.domain_area} • Nivel {currentCard.cefr_level}
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-ide-text pt-1">
                            {parsedMeta.term || currentCard.title}
                          </h3>
                          {parsedMeta.phonetic && (
                            <p className="font-mono text-xs text-ide-accent">
                              {parsedMeta.phonetic} • {parsedMeta.partOfSpeech}
                            </p>
                          )}
                          <p className="text-xs text-ide-muted max-w-lg mx-auto pt-2">
                            {currentCard.scenario_context}
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-ide-accent font-semibold">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Toca aquí para ver la respuesta en español e inglés</span>
                        </div>
                      </div>

                      {/* Reverso */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-ide-panel border-2 border-ide-accent/60 p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-ide-accent font-bold">
                            REVERSO • Significado y Ejemplo Real
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakEnglish(parsedMeta.example || currentCard.expected_pattern);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ide-surface border border-ide-border text-xs font-semibold text-ide-accent"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Escuchar ejemplo</span>
                          </button>
                        </div>

                        <div className="space-y-2.5 my-auto">
                          {parsedMeta.spanishTranslation && (
                            <p className="text-base font-extrabold text-ide-accent">
                              {parsedMeta.spanishTranslation}
                            </p>
                          )}
                          <p className="text-xs text-ide-text leading-relaxed">
                            <strong>En español:</strong> {parsedMeta.spanishDefinition || currentCard.spanish_hint}
                          </p>
                          <p className="text-xs text-ide-muted leading-relaxed">
                            <strong>In English:</strong> {parsedMeta.shortDefinition || currentCard.expected_pattern}
                          </p>
                          <div className="p-3 rounded-xl bg-ide-surface border border-ide-border space-y-1">
                            <p className="text-xs font-mono text-ide-accent">
                              "{parsedMeta.example || currentCard.expected_pattern}"
                            </p>
                            {parsedMeta.exampleEs && (
                              <p className="text-[11px] text-ide-muted">↳ {parsedMeta.exampleEs}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-ide-muted">
                          Repeticiones: {currentCard.repetitions} • Próximo intervalo actual: {currentCard.interval_days} día(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de autoevaluación estilo Duolingo */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      disabled={submitting}
                      onClick={() => submitReview({ mode: 'flashcard', known: false })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ide-danger/15 border border-ide-danger/40 border-b-2 text-ide-danger text-xs font-bold hover:bg-ide-danger/25"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>No la recordé (Repasar en 24h)</span>
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => submitReview({ mode: 'flashcard', known: true })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-ide-success/20 border border-ide-success/50 border-b-2 text-ide-success text-xs font-bold hover:bg-ide-success/30"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Ya me la sé! (+Progreso)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-ide-panel border border-ide-border space-y-2">
                    <h3 className="text-base font-bold">{currentCard.title}</h3>
                    <p className="text-xs text-ide-muted">{currentCard.scenario_context}</p>
                    <p className="text-sm font-semibold text-ide-accent pt-1">{currentCard.prompt}</p>
                  </div>

                  {/* Ayuda y pistas interactivas en español */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowSpanishHint((h) => !h)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-ide-warn"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showSpanishHint ? 'Ocultar pista en español' : 'Ver pista en español'}</span>
                    </button>
                    {showSpanishHint && currentCard.spanish_hint && (
                      <div className="p-3 rounded-xl bg-ide-panel border border-ide-warn/30 text-xs text-ide-warn space-y-2">
                        <p>{currentCard.spanish_hint}</p>
                        {keywordChips.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center pt-1">
                            <span className="text-[11px] text-ide-muted">Palabras útiles (clic para insertar):</span>
                            {keywordChips.map((kw) => (
                              <button
                                key={kw}
                                type="button"
                                onClick={() =>
                                  setWrittenInput((prev) => (prev ? `${prev} ${kw}` : kw))
                                }
                                className="px-2 py-0.5 rounded-lg bg-ide-surface border border-ide-border text-[11px] font-mono text-ide-accent hover:border-ide-accent"
                              >
                                + {kw}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={writtenInput}
                    onChange={(e) => setWrittenInput(e.target.value)}
                    placeholder="Escribe aquí tu definición o explicación en inglés..."
                    className="w-full p-3.5 rounded-xl bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                  />

                  <div className="flex justify-end">
                    <button
                      disabled={submitting || !writtenInput.trim()}
                      onClick={() => submitReview({ mode: 'written', userResponse: writtenInput })}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Comprobar Respuesta</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Banner de resultado estilo Duolingo */}
              {feedback && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs space-y-2 ${
                    feedback.isCorrect
                      ? 'bg-ide-success/15 border-ide-success/50 text-ide-text'
                      : 'bg-ide-warn/15 border-ide-warn/50 text-ide-text'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-extrabold text-sm">
                      {feedback.isCorrect
                        ? `¡Excelente! (+1 PR) • ${feedback.score}%`
                        : `A reforzar en 24h • ${feedback.score}%`}
                    </span>
                    <button
                      onClick={nextCard}
                      className="px-4 py-2 rounded-xl bg-ide-accent text-ide-bg font-bold text-xs border-b-2 border-black/25"
                    >
                      Continuar →
                    </button>
                  </div>
                  <p className="text-ide-muted">{feedback.feedback?.scheduleNote}</p>
                  <p className="font-mono text-[11px] text-ide-accent">
                    Respuesta modelo: {feedback.feedback?.expectedPattern}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cola de estudio a la derecha */}
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-ide-warn" />
              <span>Cola del Sprint ({activeQueue.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-ide-muted">{overdueCards.length} pendientes</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {activeQueue.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setFlipped(false);
                  setFeedback(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  idx === currentIdx
                    ? 'bg-ide-accentSoft border-ide-accent'
                    : 'bg-ide-panel border-ide-border hover:border-ide-accent/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold truncate">{c.title}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      c.is_overdue === 1
                        ? 'bg-ide-warn/20 text-ide-warn'
                        : 'bg-ide-success/20 text-ide-success'
                    }`}
                  >
                    {c.is_overdue === 1 ? 'HOY' : `${c.interval_days}d`}
                  </span>
                </div>
                <p className="text-[11px] text-ide-muted mt-0.5">
                  {c.domain_area} • Nivel {c.cefr_level}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
