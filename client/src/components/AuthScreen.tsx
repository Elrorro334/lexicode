import React, { useState } from 'react';
import { Code2, KeyRound, Lock, Mail, Shield, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [track, setTrack] = useState('Full-Stack');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, track });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (demoEmail: string, demoPassword: string) => {
    setError('');
    setSubmitting(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ide-bg text-ide-text flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Info Panel */}
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ide-accentSoft border border-ide-accent/30 text-ide-accent text-xs font-mono">
              <Code2 className="w-4 h-4" />
              <span>10th IDSM • SRS v1.1 • CEFR B1 → B2</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              LexiCode: Technical English for Software Engineers
            </h1>
            <p className="text-sm text-ide-muted leading-relaxed">
              Plataforma interactiva para dominar el inglés técnico en entornos reales de ingeniería:
              <strong className="text-ide-text"> Daily Standups</strong>,{' '}
              <strong className="text-ide-text">Tech Screen Interviews</strong>,{' '}
              <strong className="text-ide-text">Code Reviews</strong> y{' '}
              <strong className="text-ide-text">Flashcards con Repetición Espaciada (SM-2)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-ide-panel border border-ide-border">
              <div className="font-mono text-ide-accent font-semibold mb-1">React 18 + Tailwind</div>
              <p className="text-ide-muted">Temas VS Code Dark & Nord + Web Speech API nativa.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-ide-panel border border-ide-border">
              <div className="font-mono text-ide-success font-semibold mb-1">Express + SQL Server</div>
              <p className="text-ide-muted">JWT + RBAC y persistencia relacional ACID.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ide-panel/60 border border-ide-border text-[11px] text-ide-muted space-y-0.5">
            <p className="font-semibold text-ide-text">Proyecto Capstone — 10º IDSM (Mtra. Luz Julieta Tapia Reséndiz)</p>
            <p>Alberto Cruz • Rodrigo Sánchez • Lizeth Pérez • Oscar Salinas</p>
          </div>

          <div className="pt-2 border-t border-ide-border space-y-2">
            <p className="text-xs font-mono text-ide-muted">Acceso rápido de demostración:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickLogin('demo@lexicode.dev', 'LexiCode2026!')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ide-accentSoft border border-ide-accent/40 text-ide-accent text-xs font-medium hover:opacity-90"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Estudiante</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => quickLogin('admin@lexicode.dev', 'AdminLexi2026!')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ide-panel border border-ide-border text-ide-text text-xs font-medium hover:border-ide-accent/50"
              >
                <Shield className="w-3.5 h-3.5 text-ide-warn" />
                <span>Demo Docente (Admin RBAC)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Auth Form */}
        <div className="bg-ide-surface border border-ide-border rounded-2xl p-8 flex flex-col justify-center">
          <div className="flex gap-2 p-1 rounded-xl bg-ide-panel border border-ide-border mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'login' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                mode === 'register' ? 'bg-ide-accent text-ide-bg' : 'text-ide-muted hover:text-ide-text'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-ide-muted mb-1">Nombre completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-ide-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Ana Martínez"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ide-muted mb-1">Correo electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ide-muted absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@universidad.edu.mx"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ide-muted mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ide-muted absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-ide-muted mb-1">Especialidad (Career Track)</label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-ide-panel border border-ide-border text-sm focus:outline-none focus:border-ide-accent"
                >
                  <option value="Full-Stack">Full-Stack Engineer</option>
                  <option value="QA">QA Automation Engineer</option>
                  <option value="DevOps">DevOps / SRE Engineer</option>
                </select>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-ide-danger/15 border border-ide-danger/40 text-ide-danger text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-ide-accent text-ide-bg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Procesando...' : mode === 'login' ? 'Entrar al Workspace' : 'Registrarme y Diagnóstico'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
