'use client';

import { useState, useEffect, useCallback } from 'react';
import { messagesApi } from '@/lib/api';

const STORAGE_KEY = 'safirauto_seen_replies';

/** Returns the number of "new" messages/replies to show as badge.
 *  - Admins: count of unread messages in the inbox
 *  - Regular users: count of messages that have new admin replies since last visit
 */
export function useMessageCount(isAuthenticated: boolean, isAdmin: boolean) {
  const [count, setCount] = useState(0);

  const getSeenReplies = (): Record<string, number> => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  };

  const check = useCallback(async () => {
    if (!isAuthenticated) { setCount(0); return; }
    try {
      if (isAdmin) {
        const msgs = await messagesApi.list();
        setCount(msgs.filter(m => !m.read).length);
      } else {
        const msgs = await messagesApi.mine();
        const seen = getSeenReplies();
        let newReplies = 0;
        msgs.forEach(m => {
          const replyCount = m.replies?.length ?? 0;
          const seenCount = seen[m.id] ?? 0;
          if (replyCount > seenCount) newReplies += replyCount - seenCount;
        });
        setCount(newReplies);
      }
    } catch { /* silent fail */ }
  }, [isAuthenticated, isAdmin]);

  // Initial check + poll every 30s
  useEffect(() => {
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [check]);

  /** Call this when the user opens their messages — resets the badge */
  const markSeen = useCallback(async () => {
    if (!isAuthenticated || isAdmin) { setCount(0); return; }
    try {
      const msgs = await messagesApi.mine();
      const seen: Record<string, number> = {};
      msgs.forEach(m => { seen[m.id] = m.replies?.length ?? 0; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
      setCount(0);
    } catch { /* silent */ }
  }, [isAuthenticated, isAdmin]);

  return { count, refresh: check, markSeen };
}

