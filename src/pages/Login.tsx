import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
} from 'lucide-react';
import { useDocuments } from '../context/DocumentContext';
import type { User } from '../types/document';

interface DemoPersona {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  badge: string;
  initials: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'user_1',
    name: 'Kirubakar',
    email: 'kirubakar@engineering.org',
    role: 'Staff Systems Engineer',
    avatarColor: 'from-indigo-600 to-indigo-700',
    badge: 'Primary Author',
    initials: 'K',
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    email: 'sarah.chen@engineering.org',
    role: 'Principal Architect',
    avatarColor: 'from-emerald-600 to-teal-700',
    badge: 'Reviewer',
    initials: 'S',
  },
  {
    id: 'user_3',
    name: 'Alex Dev',
    email: 'alex.dev@engineering.org',
    role: 'Platform Lead',
    avatarColor: 'from-amber-500 to-orange-600',
    badge: 'Collaborator',
    initials: 'A',
  },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useDocuments();

  const [activeTab, setActiveTab] = useState<'quick' | 'email'>('quick');
  const [email, setEmail] = useState('kirubakar@engineering.org');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('user_1');
  const [ssoNotice, setSsoNotice] = useState<string | null>(null);

  // Authenticate using chosen persona
  const handlePersonaSelect = (persona: DemoPersona) => {
    setSelectedPersonaId(persona.id);
    setEmail(persona.email);
    setIsLoading(true);

    const targetUser: User = {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      role: persona.role,
    };

    setTimeout(() => {
      setUser(targetUser);
      setIsLoading(false);
      navigate('/dashboard');
    }, 350);
  };

  // Authenticate using manual email form
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const matchedPersona = DEMO_PERSONAS.find(
      (p) => p.email.toLowerCase() === email.toLowerCase()
    );

    const targetUser: User = matchedPersona
      ? {
          id: matchedPersona.id,
          name: matchedPersona.name,
          email: matchedPersona.email,
          role: matchedPersona.role,
        }
      : {
          id: `user_${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email: email,
          role: 'Systems Engineer',
        };

    setTimeout(() => {
      setUser(targetUser);
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  const handleSSO = (provider: 'GitHub' | 'Google') => {
    setSsoNotice(`Connecting via ${provider} SSO...`);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSsoNotice(null);
      navigate('/dashboard');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Animated Ambient Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[580px] h-[580px] bg-gradient-to-tr from-indigo-600/25 via-indigo-500/15 to-blue-500/20 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[620px] h-[620px] bg-gradient-to-bl from-purple-600/20 via-violet-600/15 to-indigo-600/20 rounded-full blur-[150px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 via-indigo-600/15 to-purple-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />

      {/* Layered Engineering Grid Patterns */}
      <div className="absolute inset-0 bg-tech-grid-dark opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-dots-dark opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_65%,transparent_100%)]" />

      {/* Subtle Geometric Corner Crosshairs */}
      <div className="absolute top-8 left-8 text-slate-800 font-mono text-sm pointer-events-none select-none hidden sm:block">
        +
      </div>
      <div className="absolute top-8 right-8 text-slate-800 font-mono text-sm pointer-events-none select-none hidden sm:block">
        +
      </div>
      <div className="absolute bottom-8 left-8 text-slate-800 font-mono text-sm pointer-events-none select-none hidden sm:block">
        +
      </div>
      <div className="absolute bottom-8 right-8 text-slate-800 font-mono text-sm pointer-events-none select-none hidden sm:block">
        +
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 shadow-xl shadow-indigo-500/30 ring-1 ring-white/25 mb-3 transform hover:scale-105 transition-all">
            <FileText className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            SyncDoc
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Collaborative technical documentation for modern engineering teams.
          </p>
        </div>

        {/* Main Card with Halo Glow */}
        <div className="relative w-full">
          {/* Subtle Outer Card Halo Glow */}
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-cyan-500/30 blur-xl opacity-75 pointer-events-none" />

          {/* Frosted Glass Card */}
          <div className="w-full bg-slate-900/85 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] relative">
            {/* Header */}
            <div className="mb-6 text-left">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Sign in to your workspace
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select a team persona for instant testing or use email.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Quick Personas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('email')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Work Email
              </button>
            </div>

            {/* TAB 1: QUICK PERSONA SELECTOR */}
            {activeTab === 'quick' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-2">
                  Select a collaborator profile to sign in:
                </p>

                {DEMO_PERSONAS.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => handlePersonaSelect(persona)}
                      className={`group p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${persona.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}
                        >
                          {persona.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                              {persona.name}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {persona.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {persona.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600/20 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-500">
                    💡 <strong className="text-slate-400">Pro tip:</strong> Open a second browser window with{' '}
                    <strong className="text-indigo-400">Sarah Chen</strong> to test real-time collaboration.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL EMAIL & PASSWORD */}
            {activeTab === 'email' && (
              <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Demo mode: Any password accepted. Please sign in.');
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span>Remember this workstation</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to SyncDoc</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social SSO Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-900 text-slate-400 font-mono text-[11px]">
                  OR ENTERPRISE SSO
                </span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSSO('GitHub')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub SSO
              </button>

              <button
                type="button"
                onClick={() => handleSSO('Google')}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                Google SSO
              </button>
            </div>

            {/* SSO notice toast */}
            {ssoNotice && (
              <div className="mt-3 p-2 bg-indigo-950/60 border border-indigo-800 rounded-lg text-xs text-indigo-300 text-center animate-in fade-in">
                {ssoNotice}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-indigo-400" /> Yjs CRDT Ready
          </span>
        </div>
      </div>
    </div>
  );
};
