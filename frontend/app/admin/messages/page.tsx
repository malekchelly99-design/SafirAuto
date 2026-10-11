'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Trash2, Check, Clock, Car, Send, MessageSquare, User, ChevronRight } from 'lucide-react';
import { messagesApi } from '@/lib/api';
import { ContactMessage } from '@/types';
import { timeAgo } from '@/lib/utils';

function timeStr(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesApi.list().then(setMessages).finally(() => setLoading(false));
  }, []);

  // scroll chat to bottom when selected changes or replies added
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [selected]);

  const handleSelect = async (m: ContactMessage) => {
    setSelected(m);
    setReplyText('');
    if (!m.read) {
      const updated = await messagesApi.markRead(m.id);
      setMessages(msgs => msgs.map(msg => msg.id === m.id ? updated : msg));
      setSelected(updated);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    await messagesApi.delete(id);
    setMessages(msgs => msgs.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await messagesApi.reply(selected.id, replyText.trim());
      setMessages(msgs => msgs.map(m => m.id === updated.id ? updated : m));
      setSelected(updated);
      setReplyText('');
    } finally {
      setReplying(false);
    }
  };

  const displayed = filter === 'unread' ? messages.filter(m => !m.read) : messages;
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto h-[calc(100vh-64px)] flex flex-col">

      {/* -- Header -- */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 bg-[#eab308] rounded-full" />
            <h1 className="text-2xl font-black text-white dark:text-white tracking-tight">Messages</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#eab308] text-white text-xs font-black rounded-full">{unreadCount}</span>
            )}
          </div>
          <p className="text-gray-400 text-sm pl-3">{messages.length} messages au total</p>
        </div>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#23272e] dark:bg-[#1c1c21] rounded-xl">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-[#1a1d23] dark:bg-[#16161a] text-white dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-200 dark:hover:text-gray-300'
              }`}
            >
              {f === 'all' ? 'Tous' : `Non lus${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* -- Two-panel layout -- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 min-h-0">

        {/* -- LEFT: message list -- */}
        <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-white/5 dark:border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#eab308]" />
              <span className="text-white dark:text-white font-bold text-sm">BoÉte de rÉception</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2 animate-pulse">
                  <div className="h-3 bg-[#23272e] dark:bg-[#1a1d23]/5 rounded w-3/4" />
                  <div className="h-2.5 bg-[#23272e] dark:bg-[#1a1d23]/5 rounded w-1/2" />
                </div>
              ))
            ) : displayed.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Aucun message</div>
            ) : displayed.map(m => (
              <button
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`w-full text-left px-4 py-3.5 hover:bg-[#1c2026] dark:hover:bg-[#1a1d23]/3 transition-colors relative ${
                  selected?.id === m.id ? 'bg-[#23272e]/60 dark:bg-[#eab308]/5 border-r-2 border-[#eab308]' : ''
                }`}
              >
                {/* Unread dot */}
                {!m.read && (
                  <span className="absolute top-4 right-3 w-2 h-2 rounded-full bg-[#eab308]" />
                )}
                <div className="flex items-center gap-2.5 mb-1 pr-4">
                  <div className="w-7 h-7 rounded-full bg-[#23272e] dark:bg-[#1a1d23]/8 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <span className={`text-sm font-bold truncate ${!m.read ? 'text-white dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {m.name}
                  </span>
                </div>
                {m.vehicle_ref && (
                  <div className="flex items-center gap-1 mb-1 pl-9">
                    <Car className="w-3 h-3 text-[#eab308] flex-shrink-0" />
                    <span className="text-[#eab308] text-xs font-medium truncate">{m.vehicle_ref}</span>
                  </div>
                )}
                <p className="text-gray-400 dark:text-gray-500 text-xs truncate pl-9">{m.subject}</p>
                <div className="flex items-center justify-between mt-1.5 pl-9">
                  <span className="text-gray-300 dark:text-gray-300 text-[10px]">{timeAgo(m.created_at)}</span>
                  {(m.replies?.length ?? 0) > 0 && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <MessageSquare className="w-2.5 h-2.5" />
                      {m.replies.length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* -- RIGHT: chat detail -- */}
        <div className="bg-[#1a1d23] dark:bg-[#16161a] border border-white/10 dark:border-white/5 rounded-2xl flex flex-col min-h-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-300 dark:text-gray-300">
              <Mail className="w-10 h-10 mb-3" />
              <p className="text-sm">SÉlectionnez un message pour rÉpondre</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 dark:border-white/5 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#23272e] dark:bg-[#1a1d23]/8 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white dark:text-white font-bold text-sm truncate">{selected.name}</p>
                    <p className="text-gray-400 text-xs truncate">{selected.email}{selected.phone ? ` É ${selected.phone}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="hidden sm:block text-gray-300 dark:text-gray-300 text-xs">{timeStr(selected.created_at)}</span>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 text-gray-300 dark:text-gray-300 hover:text-[#eab308] hover:bg-[#23272e] dark:hover:bg-[#2a2f3a]/10 rounded-lg transition-colors ml-2"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Vehicle tag */}
              {selected.vehicle_ref && (
                <div className="px-5 py-2.5 bg-[#23272e]/50 dark:bg-[#eab308]/5 border-b border-23272e dark:border-[#eab308]/10 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs">
                    <Car className="w-3.5 h-3.5 text-[#eab308]" />
                    <span className="text-[#eab308] font-semibold">{selected.vehicle_ref}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-400 font-mono text-[10px]">{selected.vehicle_id}</span>
                  </div>
                </div>
              )}

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* First message from user */}
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#1c1c21] flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div className="max-w-[70%]">
                    <div className="bg-black text-white px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed">
                      <p className="font-semibold text-white/70 text-xs mb-1">{selected.subject}</p>
                      {selected.message}
                    </div>
                    <p className="text-gray-300 dark:text-gray-300 text-[10px] mt-1">{timeStr(selected.created_at)}</p>
                  </div>
                </div>

                {/* Replies thread */}
                {(selected.replies ?? []).map(reply => {
                  const isAdmin = reply.role === 'admin';
                  return (
                    <div key={reply.id} className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : ''}`}>
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-[#1c1c21] flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      )}
                      <div className="max-w-[70%]">
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isAdmin
                            ? 'bg-[#eab308] text-white rounded-br-sm'
                            : 'bg-black text-white rounded-bl-sm'
                        }`}>
                          {reply.text}
                        </div>
                        <p className="text-gray-300 dark:text-gray-300 text-[10px] mt-1 {isAdmin ? 'text-right' : ''}">
                          {reply.author} É {timeStr(reply.created_at)}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="w-7 h-7 rounded-full bg-[#eab308] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-black">CA</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="border-t border-white/5 dark:border-white/5 p-4 flex-shrink-0">
                <form onSubmit={handleReply} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eab308] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-black">CA</span>
                  </div>
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="RÉpondre au clientÉ"
                    className="flex-1 bg-[#1c2026] dark:bg-[#1c1c21] border border-white/10 dark:border-white/8 rounded-xl px-4 py-2.5 text-sm text-white dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#eab308]/20 focus:border-[#eab308] transition-all"
                    disabled={replying}
                  />
                  <button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="w-10 h-10 bg-[#eab308] hover:bg-[#ca8a04] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    {replying
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

