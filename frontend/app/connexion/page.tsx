'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';

export default function ConnexionPage() {
  const router = useRouter();
  const { login, reload } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    if (!validateEmail(email)) { setError('Adresse e-mail invalide.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError?.response?.data?.error || 'Identifiants invalides. Veuillez rÉessayer.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!fullName || !email || !password || !confirmPwd) { setError('Veuillez remplir tous les champs.'); return; }
    if (!validateEmail(email)) { setError('Adresse e-mail invalide.'); return; }
    if (password.length < 8) { setError('Le mot de passe doit comporter au moins 8 caractÉres.'); return; }
    if (password !== confirmPwd) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (!termsAccepted) { setError("Veuillez accepter les conditions d'utilisation."); return; }
    setLoading(true);
    try {
      const tokens = await authApi.register(fullName, email, password);
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      await reload(); // sync user into AuthContext
      router.push('/'); // back to homepage É header will show user
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError?.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
    } finally { setLoading(false); }
  };

  const resetError = () => { if (error) setError(''); if (success) setSuccess(''); };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes kenburns {
          0%   { transform: scale(1.08); }
          100% { transform: scale(1.0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.18; transform: scale(1); }
          50%       { opacity: 0.32; transform: scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kenburns-img { animation: kenburns 9s ease-out forwards; }
        .glow-orb     { animation: glowPulse 6s ease-in-out infinite; }
        .field-0 { animation: fadeUp 0.55s ease both 0.10s; }
        .field-1 { animation: fadeUp 0.55s ease both 0.20s; }
        .field-2 { animation: fadeUp 0.55s ease both 0.30s; }
        .field-3 { animation: fadeUp 0.55s ease both 0.38s; }
        .field-4 { animation: fadeUp 0.55s ease both 0.46s; }
        .tab-indicator { transition: left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1); }
        .luxury-input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid #e5e7eb;
          padding: 10px 0 10px 28px;
          font-size: 0.875rem;
          color: #111;
          outline: none;
          transition: border-color 0.25s;
        }
        .luxury-input::placeholder { color: #9ca3af; }
        .luxury-input:focus { border-bottom-color: #eab308; }
        .luxury-input-wrap { position: relative; }
        .luxury-input-wrap svg.input-icon {
          position: absolute; left: 0; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: #9ca3af;
        }
        .luxury-input-wrap:focus-within svg.input-icon { color: #eab308; }
        .luxury-input-wrap::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px;
          background: #eab308;
          transition: width 0.3s cubic-bezier(.4,0,.2,1);
        }
        .luxury-input-wrap:focus-within::after { width: 100%; }
      `}} />

      <div className="min-h-screen bg-[#1a1d23] flex">

        {/* -- LEFT PANEL -- */}
        <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden">
          {/* Top red accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#eab308] z-30" />

          {/* Car image with Ken Burns */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full kenburns-img">
              <Image
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=95&auto=format&fit=crop"
                alt="Lamborghini HuracÉn EVO"
                fill
                priority
                className="object-cover"
                sizes="55vw"
              />
            </div>
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 z-10"
            style={{background:
                'linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.08) 100%)',}}
          />

          {/* Red glow orb */}
          <div
            className="glow-orb absolute z-10 rounded-full"
            style={{width: 480, height: 480,
              bottom: '-80px', left: '-100px',
              background: 'radial-gradient(circle, rgba(220,38,38,0.55) 0%, transparent 70%)',
              filter: 'blur(40px)',}}
          />

          {/* Content */}
          <div className="relative z-20 flex flex-col h-full p-12 xl:p-16">

            {/* Logo top-left */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#eab308] flex items-center justify-center">
                <span className="text-white font-black text-lg tracking-tighter">C</span>
              </div>
              <div>
                <span className="text-white font-black tracking-[0.18em] text-sm uppercase leading-none block">SafirAuto</span>
                <span className="text-white/50 text-[9px] tracking-[0.3em] uppercase">L&apos;excellence automobile</span>
              </div>
            </div>

            {/* Headline É vertically centered */}
            <div className="my-auto">
              <p className="text-white/50 text-[10px] tracking-[0.45em] uppercase font-semibold mb-6">É Espace membre</p>
              <h1 className="text-white font-black leading-[0.88] tracking-tight">
                <span className="block text-6xl xl:text-7xl">L&apos;EXCELLENCE</span>
                <span className="block text-6xl xl:text-7xl">É CHAQUE</span>
                <span className="block text-5xl xl:text-6xl font-extralight text-white/70 mt-1">TRAJET.</span>
              </h1>
              <div className="mt-7 w-12 h-[2px] bg-[#eab308]" />
              <p className="mt-5 text-white/65 text-sm leading-relaxed max-w-xs">
                Connectez-vous et dÉcouvrez notre collection exclusive de vÉhicules de prestige.
              </p>
            </div>

            {/* Bottom row: car label right */}
            <div className="flex items-end justify-between">
              <div />
              <p className="text-white/40 text-[10px] tracking-[0.25em] uppercase font-medium">
                Lamborghini HuracÉn EVO É 640 ch
              </p>
            </div>
          </div>
        </div>

        {/* -- RIGHT PANEL -- */}
        <div className="flex-1 flex flex-col bg-[#1a1d23] relative">
          {/* Mobile header banner */}
          <div className="relative h-52 lg:hidden overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#eab308] z-10" />
            <Image
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop"
              alt="SafirAuto"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 bg-[#eab308] flex items-center justify-center">
                <span className="text-white font-black text-base">C</span>
              </div>
              <span className="text-white font-black tracking-wider text-sm uppercase">SafirAuto</span>
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-gray-400 hover:text-[#eab308] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium tracking-wide">Retour au site</span>
          </Link>

          {/* Form area */}
          <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-12 lg:px-16 py-16">
            <div className="w-full max-w-[380px]">

              {/* Wordmark */}
              <div
                className={`mb-8 transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <p className="text-[#eab308] font-black text-lg tracking-[0.25em] uppercase">SafirAuto</p>
                <p className="text-gray-400 text-xs tracking-[0.2em] uppercase mt-0.5">Espace membre</p>
              </div>

              {/* Tab switcher - underline style */}
              <div
                className={`relative mb-10 transition-all duration-500 delay-75 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="flex gap-8 border-b border-white/5">
                  <button
                    onClick={() => { setActiveTab('login'); resetError(); }}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors ${
                      activeTab === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => { setActiveTab('register'); resetError(); }}
                    className={`pb-3 text-sm font-semibold tracking-wide transition-colors ${
                      activeTab === 'register' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    Créer un compte
                  </button>
                </div>
                {/* Sliding red underline */}
                <div
                  className="tab-indicator absolute bottom-0 h-[2px] bg-[#eab308]"
                  style={{left: activeTab === 'login' ? '0px' : '108px',
                    width: activeTab === 'login' ? '82px' : '116px',}}
                />
              </div>

              {/* Error / Success */}
              {error && (
                <div className="text-[#ca8a04] text-xs mb-5 flex items-start gap-2">
                  <span className="mt-0.5 w-3 h-3 rounded-full bg-[#23272e] flex-shrink-0 flex items-center justify-center">
                    <span className="w-1 h-1 bg-[#eab308] rounded-full" />
                  </span>
                  {error}
                </div>
              )}
              {success && (
                <div className="text-green-600 text-xs mb-5">{success}</div>
              )}

              {/* -- LOGIN FORM -- */}
              <form
                onSubmit={handleLogin}
                className={activeTab === 'login' ? 'block' : 'hidden'}
              >
                <div className="space-y-7">
                  <div className={`field-0 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Adresse e-mail
                    </label>
                    <div className="luxury-input-wrap">
                      <Mail className="input-icon" />
                      <input
                        type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        required autoComplete="email"
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div className={`field-1 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Mot de passe
                    </label>
                    <div className="luxury-input-wrap">
                      <Lock className="input-icon" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        required autoComplete="current-password"
                        className="luxury-input pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className={`field-2 flex items-center justify-between ${mounted ? '' : 'opacity-0'}`}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${
                          rememberMe ? 'bg-[#eab308] border-[#eab308]' : 'border-gray-300'
                        }`}
                      >
                        {rememberMe && <div className="w-1.5 h-1.5 bg-[#1a1d23]" />}
                      </button>
                      <span className="text-[11px] text-gray-400 tracking-wide">Se souvenir de moi</span>
                    </label>
                    <a href="#" className="text-[11px] text-[#eab308] hover:text-[#ca8a04] transition-colors tracking-wide">
                      Mot de passe oubliÉ ?
                    </a>
                  </div>

                  <div className={`field-3 ${mounted ? '' : 'opacity-0'}`}>
                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-[#eab308] hover:bg-[#ca8a04] text-white text-xs font-black tracking-[0.35em] uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all hover:shadow-xl hover:shadow-2a2f3a/60 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>Se connecter</span><ArrowRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>
              </form>

              {/* -- REGISTER FORM -- */}
              <form
                onSubmit={handleRegister}
                className={activeTab === 'register' ? 'block' : 'hidden'}
              >
                <div className="space-y-7">
                  <div className={`field-0 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Nom complet
                    </label>
                    <div className="luxury-input-wrap">
                      <User className="input-icon" />
                      <input
                        type="text" value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        required autoComplete="name"
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div className={`field-1 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Adresse e-mail
                    </label>
                    <div className="luxury-input-wrap">
                      <Mail className="input-icon" />
                      <input
                        type="email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        required autoComplete="email"
                        className="luxury-input"
                      />
                    </div>
                  </div>

                  <div className={`field-2 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Mot de passe
                    </label>
                    <div className="luxury-input-wrap">
                      <Lock className="input-icon" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 caractÉres"
                        required autoComplete="new-password"
                        className="luxury-input pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className={`field-3 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="block text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mb-3">
                      Confirmer le mot de passe
                    </label>
                    <div className="luxury-input-wrap">
                      <Lock className="input-icon" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        placeholder="ÉÉÉÉÉÉÉÉ"
                        required autoComplete="new-password"
                        className="luxury-input pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className={`field-4 ${mounted ? '' : 'opacity-0'}`}>
                    <label className="flex items-start gap-2 cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                      <div className={`mt-0.5 w-3.5 h-3.5 border-2 flex-shrink-0 flex items-center justify-center transition-all ${termsAccepted ? 'bg-[#eab308] border-[#eab308]' : 'border-gray-300 hover:border-[#eab308]'}`}>
                        {termsAccepted && <div className="w-1.5 h-1.5 bg-[#1a1d23]" />}
                      </div>
                      <span className="text-[11px] text-gray-400 leading-relaxed">
                        J&apos;accepte les{' '}
                        <a href="#" onClick={e => e.stopPropagation()} className="text-[#eab308] hover:underline">conditions d&apos;utilisation</a>{' '}et la{' '}
                        <a href="#" onClick={e => e.stopPropagation()} className="text-[#eab308] hover:underline">politique de confidentialitÉ</a>.
                      </span>
                    </label>
                  </div>

                  <div className={`field-4 ${mounted ? '' : 'opacity-0'}`}>
                    <button
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-[#eab308] hover:bg-[#ca8a04] text-white text-xs font-black tracking-[0.35em] uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all hover:shadow-xl hover:shadow-2a2f3a/60 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><span>CrÉer mon compte</span><ArrowRight className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center pb-6 text-[10px] text-gray-300 tracking-wider">
            É {new Date().getFullYear()} SafirAuto É Tous droits rÉservÉs
          </p>
        </div>
      </div>
    </>
  );
}

