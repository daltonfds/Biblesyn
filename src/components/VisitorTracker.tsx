'use client';

import {useEffect, useRef, useState} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

const VISITOR_KEY = 'biblesyn_visitor_id';
const SESSION_KEY = 'biblesyn_session_id';
const CONSENT_KEY = 'biblesyn_analytics_consent';

function getIds() {
  let visitorId = '';
  let sessionId = '';
  let isNewVisitor = false;
  try {
    visitorId = localStorage.getItem(VISITOR_KEY) || '';
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
      isNewVisitor = true;
    }
    sessionId = sessionStorage.getItem(SESSION_KEY) || '';
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
  } catch {
    visitorId = crypto.randomUUID();
    sessionId = crypto.randomUUID();
    isNewVisitor = true;
  }
  return {visitorId, sessionId, isNewVisitor};
}

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const lastTracked = useRef('');
  const [consent, setConsent] = useState<'unknown' | 'accepted' | 'rejected'>('unknown');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      setConsent(saved === 'accepted' ? 'accepted' : saved === 'rejected' ? 'rejected' : 'unknown');
    } catch { setConsent('unknown'); }
  }, []);

  useEffect(() => {
    if (consent !== 'accepted' || !pathname || pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/auth')) return;
    const key = pathname + (query ? '?' + query : '');
    if (lastTracked.current === key) return;
    lastTracked.current = key;

    const {visitorId, sessionId, isNewVisitor} = getIds();
    const params = new URLSearchParams(query);
    const payload = {
      visitorId,
      sessionId,
      isNewVisitor,
      pagePath: pathname,
      pageTitle: document.title,
      referrer: document.referrer,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
      utmCampaign: params.get('utm_campaign'),
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [consent, pathname, query]);

  const choose = (value: 'accepted' | 'rejected') => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch {}
    setConsent(value);
  };

  return consent === 'unknown' ? <aside role="dialog" aria-label="Analytics preferences" className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-xl">
    <p className="text-sm font-semibold">Your privacy matters</p>
    <p className="mt-1 text-xs leading-5 text-mute">Biblesyn can use anonymous analytics to understand visits, popular pages and device types. We do not store IP addresses. You can choose whether to allow analytics.</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" onClick={() => choose('accepted')} className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">Accept analytics</button>
      <button type="button" onClick={() => choose('rejected')} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink">Only necessary</button>
    </div>
  </aside> : null;
}
