import { useEffect } from 'react';
import { logVisitor } from '../lib/db';

const NOTIFICATION_EMAIL = 'narendragond014@gmail.com';
const SESSION_KEY = 'portfolio_visitor_tracked_timestamp';
const THROTTLE_MS = 30 * 60 * 1000; // 30 minutes throttle per visitor

export function useVisitorTracker() {
  useEffect(() => {
    let isSubscribed = true;

    async function trackVisit() {
      try {
        // Exclude owner themselves from triggering alerts
        if (localStorage.getItem('is_owner') === 'true') {
          return;
        }

        // Rate limiting check: Throttle notifications for 30 minutes per browser/session
        const lastTracked = localStorage.getItem(SESSION_KEY);
        const now = Date.now();
        if (lastTracked && now - parseInt(lastTracked, 10) < THROTTLE_MS) {
          return;
        }

        // 1. Detect User Agent, Browser, OS, Device
        const ua = navigator.userAgent;
        let deviceType = 'Desktop';
        if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
          deviceType = /iPad|Tablet/i.test(ua) ? 'Tablet' : 'Mobile';
        }

        let browser = 'Unknown Browser';
        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Edg')) browser = 'Edge';

        let os = 'Unknown OS';
        if (ua.includes('Win')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        const referrer = document.referrer || 'Direct Link / LinkedIn Share';
        const pageUrl = window.location.href;
        const formattedTime = new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'medium',
        });

        // 2. Fetch Geolocation from IP API
        let city = 'Unknown City';
        let region = 'Unknown Region';
        let country = 'Unknown Country';
        let org = 'Unknown ISP';
        let ip = 'Hidden / Proxy';

        try {
          const res = await fetch('https://ipapi.co/json/').catch(() => null);
          if (res && res.ok) {
            const geo = await res.json();
            ip = geo.ip || ip;
            city = geo.city || city;
            region = geo.region || region;
            country = geo.country_name || country;
            org = geo.org || geo.asn || org;
          }
        } catch {
          try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            region = timeZone || 'India/Asia';
          } catch {
            // Keep default unknown
          }
        }

        if (!isSubscribed) return;

        // 3. Mark as tracked to prevent double emails
        localStorage.setItem(SESSION_KEY, now.toString());

        // 4. Log to Supabase Database
        logVisitor({
          ip,
          city,
          region,
          country,
          org,
          device: deviceType,
          browser: `${browser} on ${os}`,
          referrer,
          user_agent: ua,
        });

        // 5. Send Immediate Email Alert to Narendra (narendragond014@gmail.com)
        const emailSubject = `👀 LinkedIn Portfolio Visitor: Someone from ${city}, ${country} is viewing your profile!`;
        const emailBody = {
          _subject: emailSubject,
          _template: 'table',
          _captcha: 'false',
          '🔔 Alert Type': 'New Portfolio Viewer Notification',
          '📍 Visitor Location': `${city}, ${region}, ${country}`,
          '🌐 IP Address & ISP': `${ip} (${org})`,
          '📱 Device Details': `${deviceType} — ${browser} on ${os}`,
          '🔗 Referrer Source': referrer,
          '📄 Page Opened': pageUrl,
          '⏰ Visit Timestamp (IST)': `${formattedTime} (IST)`,
          '💡 Owner Note': 'This automatic alert was triggered because someone landed on your portfolio website.'
        };

        await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(emailBody),
        }).catch((err) => {
          console.warn('[Visitor Tracker] Notification email dispatch notice:', err);
        });

      } catch (err) {
        console.error('[Visitor Tracker] Error tracking visitor:', err);
      }
    }

    trackVisit();

    return () => {
      isSubscribed = false;
    };
  }, []);
}
