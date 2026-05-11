'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let sid = sessionStorage.getItem('studyaxis_sid');
    if (!sid) {
      sid = generateSessionId();
      sessionStorage.setItem('studyaxis_sid', sid);
    }
    setSessionId(sid);

    // Track device type
    const ua = navigator.userAgent;
    let deviceType = 'desktop';
    if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
    else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';

    // Track Pageview
    if (pathname && !pathname.startsWith('/admin')) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          eventType: 'pageview',
          path: pathname,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          deviceType
        })
      }).catch(() => {});
    }
  }, [pathname]);

  // Track global clicks (Heatmap style logic)
  useEffect(() => {
    if (!sessionId) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Only track significant clicks (buttons, links, or specific data attributes)
      const isSignificant = target.closest('button') || target.closest('a') || target.hasAttribute('data-track');
      if (!isSignificant) return;

      const element = target.closest('button') || target.closest('a') || target;
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventType: 'click',
          path: pathname,
          elementText: element.textContent?.slice(0, 50).trim(),
          elementId: element.id || element.className.slice(0, 50),
          metadata: { tagName: element.tagName, x: e.clientX, y: e.clientY }
        })
      }).catch(() => {});
    };

    document.addEventListener('click', handleClick, { passive: true });
    return () => document.removeEventListener('click', handleClick);
  }, [pathname, sessionId]);

  return <>{children}</>;
}
