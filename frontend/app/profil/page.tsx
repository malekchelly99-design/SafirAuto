'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Lock, Heart, MessageSquare, Car,
  Check, AlertCircle, ArrowLeft, Edit3, Save, X,
  ChevronRight, Clock, Send,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { PageLoader } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { authApi, messagesApi } from '@/lib/api';
import { ContactMessage } from '@/types';
import { timeAgo } from '@/lib/utils';
import { useMessageCount } from '@/lib/useMessageCount';

function avatarColor(name: string) {
  const colors = ['bg-[#eab308]','bg-rose-500','bg-orange-500','bg-amber-500','bg-emerald-500','bg-blue-500','bg-violet-500','bg-pink-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

type Tab = 'info' | 'messages' | 'security';

export default function ProfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading, reload } = useAuth();
  const { markSeen } = useMessageCount(isAuthenticated, false);

  const [tab, setTab] = useState<Tab>(() => {
    // support ?tab=messages deep-link
    const t = searchParams.get('tab');
    return (t === 'messages' || t === 'security') ? t as Tab : 'info';
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Info form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Password form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Messages
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/connexion');
  }, [loading, isAuthenticated, router]);

  // Populate form from user
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Load messages when tab switches
  useEffect(() => {
    if (tab === 'messages' && isAuthenticated) {
      setLoadingMsgs(true);
      messagesApi.mine().then(setMessages).finally(() => setLoadingMsgs(false));
    }
  }, [tab, isAuthenticated]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  const displayName = user.first_name || user.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const bg = avatarColor(displayName);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ first_name: firstName, last_name: lastName, email });
      await reload();
      setEditing(false);
      showFeedback('success', 'Profil mis à jour avec succès.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showFeedback('error', e?.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) { showFeedback('error', 'Les mots de passe ne correspondent pas.'); return; }
    if (newPwd.length < 8) { showFeedback('error', 'Le mot de passe doit comporter au moins 8 caractères.'); return; }
    setSaving(true);
    try {
      await authApi.updateProfile({ current_password: currentPwd, new_password: newPwd });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      showFeedback('success', 'Mot de passe modifié avec succès.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showFeedback('error', e?.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserReply = async (messageId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(messageId);
    try {
      const updated = await messagesApi.userReply(messageId, replyText.trim());
      setMessages(msgs => msgs.map(m => m.id === messageId ? updated : m));
      setSelectedMsg(updated);
      setReplyText('');
      markSeen();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      showFeedback('error', e?.response?.data?.error || 'Erreur lors de l\'envoi.');
    } finally {
      setReplying(null);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'info',     label: 'Mon profil',   icon: <User className="w-4 h-4" /> },
    { key: 'messages', label: 'Mes messages', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'security', label: 'Sécurité',     icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 bg-[#1c2026] dark:bg-[#0a0a0b]">

        {/* ── Hero banner ── */}
        <div className="bg-[#1a1d23] dark:bg-[#111114] border-b border-white/10 dark:border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#eab308] text-xs font-medium mb-6 transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Retour au site
            </Link>

            <div className="flex items-center gap-5">
              {/* Big avatar */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0 ${bg}`}>
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white dark:text-white tracking-tight">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide ${
                  user.is_admin
                    ? 'bg-[#eab308]/10 text-[#eab308]'
                    : 'bg-[#23272e] dark:bg-[#1a1d23]/8 text-gray-500'
                }`}>
                  {user.is_admin ? 'Administrateur' : 'Membre'}
                </span>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 mt-8 border-b border-white/5 dark:border-white/5 -mb-px">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                    tab === t.key
                      ? 'border-[#eab308] text-[#eab308]'
                      : 'border-transparent text-gray-400 hover:text-gray-200 dark:hover:text-gray-300'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Feedback toast */}
          {feedback && (
            <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-green-700 dark:text-green-400'
                : 'bg-[#23272e] dark:bg-[#2a2f3a]/20 border border-2a2f3a dark:border-red-800/40 text-[#ca8a04] dark:text-red-400'
            }`}>
              {feedback.type === 'success'
                ? <Check className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />
              }
              {feedback.msg}
            </div>
          )}

          {/* ── TAB: INFO ── */}
          {tab === 'info' && (
            <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 dark:border-white/5">
                <h2 className="text-white dark:text-white font-bold">Informations personnelles</h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-xs font-bold text-[#eab308] hover:text-[#ca8a04] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditing(false); setFirstName(user.first_name || ''); setLastName(user.last_name || ''); setEmail(user.email || ''); }}
                    className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Annuler
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveInfo} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold tracking-wide uppercase mb-2">Prénom</label>
                    {editing ? (
                      <input
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 text-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                      />
                    ) : (
                      <p className="text-white dark:text-white font-medium px-4 py-3 bg-[#1c2026] dark:bg-[#1c1c21] rounded-xl text-sm">{user.first_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold tracking-wide uppercase mb-2">Nom</label>
                    {editing ? (
                      <input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 text-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                      />
                    ) : (
                      <p className="text-white dark:text-white font-medium px-4 py-3 bg-[#1c2026] dark:bg-[#1c1c21] rounded-xl text-sm">{user.last_name || '—'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold tracking-wide uppercase mb-2">Adresse e-mail</label>
                  {editing ? (
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 text-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                      />
                    </div>
                  ) : (
                    <p className="text-white dark:text-white font-medium px-4 py-3 bg-[#1c2026] dark:bg-[#1c1c21] rounded-xl text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </p>
                  )}
                </div>

                {editing && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-white text-sm font-black rounded-xl transition-colors disabled:opacity-60"
                    >
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Save className="w-4 h-4" />
                      }
                      Enregistrer
                    </button>
                  </div>
                )}
              </form>

              {/* Quick links */}
              <div className="border-t border-white/5 dark:border-white/5 divide-y divide-gray-50 dark:divide-white/5">
                {[
                  { href: '/mes-favoris', icon: Heart, label: 'Mes véhicules favoris', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                  { href: '/vehicules', icon: Car, label: 'Parcourir le catalogue', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                ].map(({ href, icon: Icon, label, color, bg: ibg }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#1c2026] dark:hover:bg-[#1a1d23]/3 transition-colors group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ibg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-gray-200 dark:text-gray-300 text-sm font-medium group-hover:text-white dark:group-hover:text-white flex-1 transition-colors">{label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB: MESSAGES ── */}
          {tab === 'messages' && (
            <div className="space-y-4">
              {loadingMsgs ? (
                <div className="bg-[#1a1d23] dark:bg-[#16161a] rounded-2xl p-8 text-center text-gray-400 text-sm">Chargement…</div>
              ) : messages.length === 0 ? (
                <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl p-12 flex flex-col items-center gap-4 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-200 dark:text-gray-200" />
                  <div>
                    <p className="text-gray-200 dark:text-gray-300 font-semibold text-sm">Aucun message envoyé</p>
                    <p className="text-gray-400 text-xs mt-1">Vos conversations avec notre équipe apparaîtront ici</p>
                  </div>
                  <Link href="/vehicules" className="px-5 py-2 bg-[#eab308] hover:bg-[#ca8a04] text-white text-xs font-black rounded-xl transition-colors">
                    PARCOURIR LES VÉHICULES
                  </Link>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden">
                    {/* Message header */}
                    <button
                      onClick={() => setSelectedMsg(selectedMsg?.id === msg.id ? null : msg)}
                      className="w-full flex items-start gap-4 px-5 py-4 hover:bg-[#1c2026] dark:hover:bg-[#1a1d23]/3 transition-colors text-left"
                    >
                      <div className="w-9 h-9 bg-[#eab308]/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Car className="w-4 h-4 text-[#eab308]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-white dark:text-white font-semibold text-sm truncate">{msg.subject}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(msg.replies?.length ?? 0) > 0 && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                                {msg.replies.length} réponse{msg.replies.length > 1 ? 's' : ''}
                              </span>
                            )}
                            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${selectedMsg?.id === msg.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        {msg.vehicle_ref && (
                          <p className="text-[#eab308] text-xs font-medium truncate">{msg.vehicle_ref}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {timeAgo(msg.created_at)}
                        </div>
                      </div>
                    </button>

                    {/* Expanded chat thread */}
                    {selectedMsg?.id === msg.id && (
                      <div className="border-t border-white/5 dark:border-white/5 px-5 py-4 space-y-3 bg-[#1c2026]/50 dark:bg-black/10">
                        {/* User's message */}
                        <div className="flex justify-end">
                          <div className="max-w-[80%]">
                            <div className="bg-[#eab308] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
                              {msg.message}
                            </div>
                            <p className="text-gray-300 text-[10px] mt-1 text-right">
                              {new Date(msg.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                            </p>
                          </div>
                        </div>

                        {/* Admin replies */}
                        {(msg.replies ?? []).length === 0 ? (
                          <div className="text-center py-3">
                            <p className="text-gray-400 text-xs italic">En attente de réponse de notre équipe…</p>
                          </div>
                        ) : (msg.replies ?? []).map(reply => (
                          <div key={reply.id} className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#eab308] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[10px] font-black">CA</span>
                            </div>
                            <div className="max-w-[80%]">
                              <div className="bg-[#1a1d23] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-white dark:text-gray-200 leading-relaxed">
                                {reply.text}
                              </div>
                              <p className="text-gray-400 text-[10px] mt-1">
                                {reply.author} · {new Date(reply.created_at).toLocaleString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* User reply input */}
                        <form onSubmit={e => handleUserReply(msg.id, e)} className="flex items-end gap-2 pt-2 border-t border-white/10 dark:border-white/5">
                          <div className="w-7 h-7 rounded-full bg-[#eab308] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-black">{user.first_name?.[0]?.toUpperCase() || 'U'}</span>
                          </div>
                          <div className="flex-1 flex items-end gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Répondre à l'équipe…"
                              className="flex-1 bg-[#1a1d23] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-white dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                              disabled={replying === msg.id}
                            />
                            <button
                              type="submit"
                              disabled={replying === msg.id || !replyText.trim()}
                              className="w-10 h-10 bg-[#eab308] hover:bg-[#ca8a04] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                            >
                              {replying === msg.id
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send className="w-4 h-4" />}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── TAB: SECURITY ── */}
          {tab === 'security' && (
            <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 dark:border-white/5">
                <h2 className="text-white dark:text-white font-bold">Changer le mot de passe</h2>
                <p className="text-gray-400 text-xs mt-0.5">Assurez-vous d&apos;utiliser un mot de passe fort d&apos;au moins 8 caractères</p>
              </div>
              <form onSubmit={handleSavePwd} className="p-6 space-y-5 max-w-md">
                {[
                  { label: 'Mot de passe actuel', val: currentPwd, set: setCurrentPwd, auto: 'current-password' },
                  { label: 'Nouveau mot de passe', val: newPwd, set: setNewPwd, auto: 'new-password' },
                  { label: 'Confirmer le nouveau mot de passe', val: confirmPwd, set: setConfirmPwd, auto: 'new-password' },
                ].map(({ label, val, set, auto }) => (
                  <div key={label}>
                    <label className="block text-xs text-gray-400 font-semibold tracking-wide uppercase mb-2">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={val}
                        onChange={e => set(e.target.value)}
                        autoComplete={auto}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 text-white dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all placeholder-gray-400"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-white text-sm font-black rounded-xl transition-colors disabled:opacity-60"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save className="w-4 h-4" />
                  }
                  Mettre à jour le mot de passe
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

