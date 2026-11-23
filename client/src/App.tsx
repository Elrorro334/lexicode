import React, { useEffect, useState } from 'react';
import { Award, Download, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import CodeBootSplash from './components/CodeBootSplash';
import CreditsModal from './components/CreditsModal';
import Navbar, { type ActiveTab } from './components/Navbar';
import OnboardingDiagnosticModal from './components/OnboardingDiagnosticModal';
import LearningPath from './components/LearningPath';
import SprintBoard from './components/SprintBoard';
import GrammarPractice, { type GrammarSubMode } from './components/GrammarPractice';
import ScrumSpeechRoom from './components/ScrumSpeechRoom';
import TechScreenSimulator from './components/TechScreenSimulator';
import TelemetryDashboard from './components/TelemetryDashboard';

function Workspace() {
  const { user, loading, toastAchievement } = useAuth();
  const [bootDone, setBootDone] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('path');
  const [grammarSubHint, setGrammarSubHint] = useState<GrammarSubMode | undefined>(undefined);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (user && !user.placement_completed) {
      setOnboardingOpen(true);
    }
  }, [user]);

  const handleNavigate = (tab: ActiveTab, subHint?: string) => {
    if (tab === 'grammar' && subHint) {
      setGrammarSubHint(subHint as GrammarSubMode);
    }
    setActiveTab(tab);
  };

  const triggerPwaInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <>
      {!bootDone && <CodeBootSplash onComplete={() => setBootDone(true)} />}

      {loading ? (
        <div className="min-h-screen bg-ide-bg text-ide-text flex items-center justify-center font-mono text-sm">
          Iniciando LexiCode Workspace...
        </div>
      ) : !user ? (
        <AuthScreen />
      ) : (
        <div className="min-h-screen bg-ide-bg text-ide-text flex flex-col">
          <Navbar
            activeTab={activeTab}
            setActiveTab={(tab) => handleNavigate(tab)}
            onOpenOnboarding={() => setOnboardingOpen(true)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="bg-ide-surface border border-ide-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold">
                  Hola, <span className="text-ide-accent">{user.name}</span>
                </h1>
                <p className="text-xs text-ide-muted">
                  Especialidad: <strong className="text-ide-text">{user.track}</strong> • Tu meta:{' '}
                  <strong className="text-ide-text">Nivel {user.cefr_level} → B2 Profesional</strong>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {installPrompt && (
                  <button
                    onClick={triggerPwaInstall}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-ide-accentSoft border border-ide-accent text-ide-accent hover:brightness-110"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Instalar App (PWA)</span>
                  </button>
                )}
                <div className="text-xs font-mono px-3.5 py-2 rounded-xl bg-ide-panel border border-ide-border text-ide-muted">
                  Meta de hoy: <strong className="text-ide-text">1 Lección de Vocabulario + 1 Práctica</strong>
                </div>
              </div>
            </div>

            {activeTab === 'path' && <LearningPath onNavigate={handleNavigate} />}
            {activeTab === 'sprint' && <SprintBoard />}
            {activeTab === 'grammar' && <GrammarPractice initialSubMode={grammarSubHint} />}
            {activeTab === 'scrum' && <ScrumSpeechRoom />}
            {activeTab === 'interview' && <TechScreenSimulator />}
            {activeTab === 'analytics' && <TelemetryDashboard />}
          </main>

          <footer className="border-t border-ide-border bg-ide-surface py-5 px-6 text-xs text-ide-muted">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-center md:text-left space-y-0.5">
                <p className="font-mono text-ide-text font-semibold">
                  LexiCode Capstone (PWA) • Universidad Tecnológica — 10º IDSM
                </p>
                <p className="text-[11px]">
                  Equipo: Alberto Cruz Zepeda, Rodrigo Sánchez Cruz, Lizeth Pérez Atanacio y Oscar José Salinas Escobar • Asesora: Mtra. Luz Julieta Tapia Reséndiz
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreditsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ide-panel border border-ide-border text-ide-accent font-semibold hover:border-ide-accent shrink-0"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ver Créditos del Equipo</span>
              </button>
            </div>
          </footer>

          <OnboardingDiagnosticModal
            isOpen={onboardingOpen}
            onClose={() => setOnboardingOpen(false)}
          />

          <CreditsModal isOpen={creditsOpen} onClose={() => setCreditsOpen(false)} />

          {toastAchievement && (
            <div className="fixed bottom-5 right-5 z-50 bg-ide-surface border-2 border-ide-accent rounded-2xl p-4 shadow-2xl flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-ide-accentSoft text-ide-accent flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-mono text-ide-accent font-bold">¡Nuevo logro desbloqueado!</p>
                <p className="font-bold text-ide-text">{toastAchievement.title}</p>
                <p className="text-ide-muted">+{toastAchievement.xp_reward} XP</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Workspace />
    </AuthProvider>
  );
}
