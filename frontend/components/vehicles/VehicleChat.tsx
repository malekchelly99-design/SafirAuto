'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Send, MessageSquare, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { messagesApi } from '@/lib/api';
import { ContactMessage } from '@/types';

interface Props {
  vehicleId: string;
  vehicleRef: string; // e.g. "Porsche 911 GTS"
}

function timeStr(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function avatarColor(name: string) {
  const colors = ['bg-[#eab308]','bg-rose-500','bg-orange-500','bg-amber-500','bg-emerald-500','bg-blue-500','bg-violet-500','bg-pink-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

export default function VehicleChat({ vehicleId, vehicleRef }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load existing messages for this vehicle when opened
  useEffect(() => {
    if (!open || !isAuthenticated) return;
    setLoading(true);
    messagesApi.byVehicle(vehicleId)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [open, isAuthenticated, vehicleId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await messagesApi.create({
        name: user?.first_name || user?.username || 'Utilisateur',
        email: user?.email || '',
        subject: `Question sur ${vehicleRef}`,
        message: text.trim(),
        vehicle_id: vehicleId,
        vehicle_ref: vehicleRef,
      });
      setMessages(prev => [...prev, msg]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const displayName = user?.first_name || user?.username || 'Moi';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl overflow-hidden">
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#1c2026] dark:hover:bg-[#1a1d23]/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#eab308]/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#eab308]" />
          </div>
          <div className="text-left">
            <p className="text-white dark:text-white font-bold text-sm">Discuter avec nous</p>
            <p className="text-gray-400 text-xs">Posez vos questions sur ce véhicule</p>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />
        }
      </button>

      {/* Body */}
      {open && (
        <div className="border-t border-white/5 dark:border-white/5">
          {!isAuthenticated ? (
            /* Not logged in — prompt */
            <div className="flex flex-col items-center justify-center py-10 px-6 gap-4">
              <div className="w-12 h-12 bg-[#23272e] dark:bg-[#1a1d23]/5 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-white dark:text-white font-semibold text-sm mb-1">Connectez-vous pour discuter</p>
                <p className="text-gray-400 text-xs">Posez vos questions directement à notre équipe</p>
              </div>
              <Link
                href="/connexion"
                className="px-6 py-2.5 bg-[#eab308] hover:bg-[#ca8a04] text-white text-xs font-black tracking-widest rounded-xl transition-colors"
              >
                SE CONNECTER
              </Link>
            </div>
          ) : (
            <div className="flex flex-col" style={{ height: '420px' }}>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">Chargement…</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                    <MessageSquare className="w-8 h-8 text-gray-200 dark:text-gray-200" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Aucun message pour l&apos;instant</p>
                    <p className="text-gray-400 dark:text-gray-300 text-xs">Envoyez votre première question ci-dessous</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className="space-y-3">
                      {/* User message bubble */}
                      <div className="flex items-end gap-2 justify-end">
                        <div className="max-w-[75%]">
                          <div className="bg-[#eab308] text-white px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
                            {msg.message}
                          </div>
                          <p className="text-gray-400 text-[10px] mt-1 text-right">{timeStr(msg.created_at)}</p>
                        </div>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black ${avatarColor(displayName)}`}>
                          {initials}
                        </div>
                      </div>

                      {/* Admin replies */}
                      {msg.replies && msg.replies.length > 0 && msg.replies.map(reply => (
                        <div key={reply.id} className="flex items-end gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#1c1c21] flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-300 dark:text-gray-400 text-[10px] font-black">CA</span>
                          </div>
                          <div className="max-w-[75%]">
                            <div className="bg-[#23272e] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-white dark:text-gray-200 leading-relaxed">
                              {reply.text}
                            </div>
                            <p className="text-gray-400 text-[10px] mt-1">{reply.author} · {timeStr(reply.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div className="border-t border-white/5 dark:border-white/5 p-3">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-black ${avatarColor(displayName)}`}>
                    {initials}
                  </div>
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Posez votre question…"
                    className="flex-1 bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-white dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="w-9 h-9 bg-[#eab308] hover:bg-[#ca8a04] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    {sending
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-3.5 h-3.5" />
                    }
                  </button>
                </form>
                <p className="text-gray-400 text-[10px] mt-2 text-center">
                  Notre équipe répond généralement sous 24h
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

