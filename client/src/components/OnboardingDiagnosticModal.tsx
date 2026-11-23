import React, { useState } from 'react';
import { CheckCircle2, Compass, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { CareerTrack, UserProfile } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DIAGNOSTIC_QUESTIONS = [
  {
    q: '1. ¿Cuál frase está en Voz Pasiva objetiva para un reporte de falla (RCA)?',
    choices: [
      'We restarted the server after we noticed the leak.',
      'The server was restarted after the memory leak was identified.',
      'The server restarting when leak noticed.'
    ]
  },
  {
    q: '2. ¿Cuál Primera Condicional está escrita correctamente (sin "will" tras "if")?',
    choices: [
      'If the container will fail, Docker restarts it.',
      'If the container fails, Kubernetes will restart the pod.',
      'If the container failing, it will restarted.'
    ]
  },
  {
    q: '3. ¿Cuál comentario es más respetuoso y profesional en un Pull Request?',
    choices: [
      'Change this immediately, it is awful.',
      'You must rewrite this loop right now.',
      'Could we extract this helper to avoid code duplication?'
    ]
  },
  {
    q: '4. ¿Qué mide el término técnico "throughput" en una API?',
    choices: [
      'The number of requests processed per unit of time.',
      'The physical length of an Ethernet cable.',
      'The total disk size of a SQL Server backup.'
    ]
  },
  {
    q: '5. ¿Qué frase usa bien los tiempos verbales en un Daily Standup (Ayer / Hoy)?',
    choices: [
      'Yesterday I resolve the bug and today I wrote tests.',
      'Yesterday I resolved the bug, and today I am writing integration tests.',
      'Yesterday I am resolving the bug and today I resolved it.'
    ]
  }
];

export default function OnboardingDiagnosticModal({ isOpen, onClose }: Props) {
  const { user, updateUser } = useAuth();
  const [track, setTrack] = useState<CareerTrack>(user?.track || 'Full-Stack');
  const [answers, setAnswers] = useState<number[]>(Array(DIAGNOSTIC_QUESTIONS.length).fill(-1));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ placedLevel: string; diagnosticScore: number } | null>(null);

  if (!isOpen) return null;

  const allAnswered = answers.every((a) => a >= 0);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<{
        placedLevel: string;
        diagnosticScore: number;
        user: UserProfile;
      }>('/api/auth/diagnostic', {
        method: 'POST',
        body: JSON.stringify({ track, answers })
      });
      updateUser(res.user);
      setResult({ placedLevel: res.placedLevel, diagnosticScore: res.diagnosticScore });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-ide-surface border border-ide-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-ide-border pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-ide-accent" />
            <h2 className="text-lg font-bold">Configuración Inicial: Especialidad y Nivel</h2>
          </div>
          {user?.placement_completed ? (
            <button onClick={onClose} className="p-1 text-ide-muted hover:text-ide-text">
              <X className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        {result ? (
          <div className="p-6 rounded-xl bg-ide-panel border border-ide-success/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-ide-success mx-auto" />
            <h3 className="text-xl font-bold">¡Listo! Nivel asignado: {result.placedLevel}</h3>
            <p className="text-sm text-ide-muted">
              Obtuviste <strong className="text-ide-text">{result.diagnosticScore}%</strong>. Tu ruta personalizada es{' '}
              <strong className="text-ide-accent">{track}</strong>.
            </p>
            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-sm"
            >
              Ir a Mi Ruta de Aprendizaje →
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-ide-text mb-2">
                Paso 1: Elige tu área de enfoque (Career Track)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Full-Stack', 'QA', 'DevOps'] as CareerTrack[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrack(t)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                      track === t
                        ? 'bg-ide-accentSoft border-ide-accent text-ide-accent'
                        : 'bg-ide-panel border-ide-border text-ide-muted hover:text-ide-text'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-semibold text-ide-text">
                Paso 2: Responde estas 5 preguntas rápidas para ubicar tu nivel (B1 a B2)
              </p>
              {DIAGNOSTIC_QUESTIONS.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-ide-panel border border-ide-border space-y-2">
                  <p className="text-xs font-semibold text-ide-text">{item.q}</p>
                  <div className="space-y-1.5">
                    {item.choices.map((choice, cIdx) => (
                      <label
                        key={cIdx}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          answers[idx] === cIdx
                            ? 'bg-ide-accentSoft border-ide-accent text-ide-text'
                            : 'bg-ide-surface border-ide-border text-ide-muted hover:text-ide-text'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`diag-${idx}`}
                          checked={answers[idx] === cIdx}
                          onChange={() => {
                            const next = [...answers];
                            next[idx] = cIdx;
                            setAnswers(next);
                          }}
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={!allAnswered || submitting}
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-ide-accent text-ide-bg font-bold text-sm disabled:opacity-40"
              >
                {submitting ? 'Calculando tu nivel...' : 'Guardar y Comenzar →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
