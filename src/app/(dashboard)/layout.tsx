'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/dashboard', label: 'Command Center' },
  { href: '/dashboard/agents', label: 'Agents' },
  { href: '/dashboard/library', label: 'Library' },
  { href: '/dashboard/leads', label: 'Leads / CRM' },
  { href: '/dashboard/students', label: 'Students' },
  { href: '/dashboard/schedule', label: 'Schedule' },
  { href: '/dashboard/revenue', label: 'Revenue' },
  { href: '/dashboard/costs', label: 'AI Costs' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500&display=swap');

        :root {
          --sidebar-bg: #1C1A2E;
          --sidebar-border: rgba(255,255,255,0.07);
          --sidebar-text: rgba(240,238,248,0.6);
          --sidebar-active: #F0EEF8;
          --page-bg: #F0EEE8;
          --card-bg: #FFFFFF;
          --ink: #1A1825;
          --body: #4A4760;
          --muted: #8E8BA8;
          --border: rgba(26,24,37,0.08);
          --accent: #7B68EE;
          --accent-soft: rgba(123,104,238,0.1);
          --accent-border: rgba(123,104,238,0.2);
          --green: #22C55E;
          --green-soft: rgba(34,197,94,0.1);
          --amber: #F59E0B;
          --amber-soft: rgba(245,158,11,0.1);
          --red: #EF4444;
          --red-soft: rgba(239,68,68,0.1);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Instrument Sans', sans-serif; background: var(--page-bg); }

        .dash-shell { display: flex; min-height: 100vh; }

        /* SIDEBAR */
        .sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; bottom: 0;
          z-index: 50;
        }
        .sidebar-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--sidebar-border);
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; font-weight: 700;
          color: #F0EEF8; letter-spacing: -0.02em;
          text-decoration: none; display: block;
        }
        .sidebar-logo em { font-style: normal; color: var(--accent); }
        .sidebar-section { padding: 20px 12px 8px; font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(240,238,248,0.25); }
        .sidebar-nav { flex: 1; padding: 8px 12px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 13.5px; font-weight: 400;
          color: var(--sidebar-text);
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .sidebar-link:hover { background: rgba(255,255,255,0.06); color: #F0EEF8; }
        .sidebar-link.active { background: rgba(123,104,238,0.18); color: var(--sidebar-active); font-weight: 500; }
        .sidebar-link-icon { font-size: 15px; width: 20px; text-align: center; }
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--sidebar-border);
        }
        .sidebar-back {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: rgba(240,238,248,0.35);
          text-decoration: none; padding: 8px 12px; border-radius: 8px;
          transition: color 0.15s;
        }
        .sidebar-back:hover { color: rgba(240,238,248,0.7); }

        /* MAIN */
        .dash-main { margin-left: 220px; flex: 1; min-height: 100vh; }
        .dash-topbar {
          height: 56px; background: rgba(240,238,232,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
          position: sticky; top: 0; z-index: 40;
        }
        .dash-topbar-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; }
        .dash-topbar-right { display: flex; align-items: center; gap: 12px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px var(--green-soft); }
        .status-label { font-size: 12px; color: var(--muted); }
        .dash-content { padding: 28px 32px; }
      `}</style>

      <div className="dash-shell">
        <aside className="sidebar">
          <a href="/" className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/logo.jpg" alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
            <span>theForward<em>ist</em></span>
          </a>
          <div className="sidebar-section">Menu</div>
          <nav className="sidebar-nav">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${path === item.href ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href="/" className="sidebar-back">← Back to site</a>
          </div>
        </aside>

        <main className="dash-main" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="dash-topbar">
            <span className="dash-topbar-title">Mission Control</span>
            <div className="dash-topbar-right">
              <Link href="/" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none', marginRight: 16 }}>
                ← View Site
              </Link>
              <div className="status-dot"></div>
              <span className="status-label">Agents online</span>
            </div>
          </div>
          <div className="dash-content">{children}</div>
        </main>
      </div>
    </>
  )
}
