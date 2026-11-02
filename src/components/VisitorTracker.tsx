'use client';

import {useEffect, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

const VISITOR_KEY = 'biblesyn_visitor_id';
const SESSION_KEY = 'biblesyn_session_id';

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

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/auth')) return;
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
  }, [pathname, query]);

  return null;
}
