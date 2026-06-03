'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ── Seed data fallbacks ───────────────────────────────────
const SEED_APPS = [
  {
    id: 'palmtreefit',
    name: 'PalmTreeFit',
    status: 'Free',
    description: 'Simple workout app built to cut excuses. No complicated plans — open, see what to do, go do it.',
    downloads: 247,
    ai_cost: 4.20,
    audience: 'Everyone',
  },
  {
    id: 'goldrush',
    name: 'GoldRush Allstars',
    status: 'Paid',
    description: 'Team management and stats tracking for youth sports. Keeps coaches, parents, and players aligned.',
    downloads: 1,
    ai_cost: 1.80,
    audience: 'Sports',
  },
  {
    id: 'aischoolhq',
    name: 'AI School HQ',
    status: 'Building',
    description: 'Mission control for The Forwardist. Agents, content, leads, and publishing — all in one place.',
    downloads: 0,
    ai_cost: 18.50,
    audience: 'Educators',
  },
]

const SUGGESTED_QUESTIONS = [
  'What are teens saying about AI on TikTok and Reddit?',
  'What do small business owners struggle with most in 2026?',
  'Which AI courses disappoint people most and why?',
  'What are parents paying for teen tech education?',
]

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  current:   { bg: 'rgba(34,197,94,0.1)',    color: '#15803D' },
  'refresh due': { bg: 'rgba(245,158,11,0.1)', color: '#B45309' },
  running:   { bg: 'rgba(123,104,238,0.1)',   color: '#7B68EE' },
  sent:      { bg: 'rgba(34,197,94,0.1)',     color: '#15803D' },
  draft:     { bg: 'rgba(26,24,37,0.06)',     color: '#8E8BA8' },
  error:     { bg: 'rgba(239,68,68,0.1)',     color: '#B91C1C' },
  Free:      { bg: 'rgba(34,197,94,0.1)',     color: '#15803D' },
  Paid:      { bg: 'rgba(123,104,238,0.1)',   color: '#7B68EE' },
  Building:  { bg: 'rgba(245,158,11,0.1)',    color: '#B45309' },
}

function Badge({ label }: { label: string }) {
  const s = STATUS_COLORS[label] ?? { bg: 'rgba(26,24,37,0.06)', color: '#8E8BA8' }
  return (
    <span style={{
      display: 'inline-block', fontSize: 10.5, fontWeight: 600,
      padding: '2px 9px', borderRadius: 100,
      background: s.bg, color: s.color,
      letterSpacing: '0.03em',
      fontFamily: "'Instrument Sans', sans-serif",
    }}>{label}</span>
  )
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function Section({
  title, subtitle, count, rightSlot, children, defaultOpen = true,
}: {
  title: string; subtitle: string; count?: number;
  rightSlot?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{
      background: '#fff', border: '1px solid rgba(26,24,37,0.08)',
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 20px', cursor: 'pointer',
          borderBottom: open ? '1px solid rgba(26,24,37,0.08)' : 'none',
          userSelect: 'none',
        }}
      >
        {/* Chevron */}
        <span style={{
          fontSize: 12, color: '#8E8BA8', transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block',
        }}>›</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 15, fontWeight: 700, color: '#1A1825', letterSpacing: '-0.01em',
          }}>{title}</div>
          <div style={{ fontSize: 12, color: '#8E8BA8', marginTop: 2, fontFamily: "'Instrument Sans', sans-serif" }}>
            {subtitle}
          </div>
        </div>
        {count !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
            background: 'rgba(26,24,37,0.06)', color: '#4A4760',
            fontFamily: "'Instrument Sans', sans-serif",
          }}>{count}</span>
        )}
        {rightSlot && (
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {open && <div>{children}</div>}
    </div>
  )
}

// ── Button helpers ─────────────────────────────────────────
function BtnAccent({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12.5, fontWeight: 500, color: '#fff',
      background: disabled ? '#B0AAD8' : '#7B68EE', border: 'none',
      padding: '7px 14px', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'Instrument Sans', sans-serif", whiteSpace: 'nowrap', transition: 'opacity 0.15s',
    }}>{children}</button>
  )
}

function BtnGhost({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12.5, fontWeight: 500, color: '#4A4760',
      background: 'transparent', border: '1px solid rgba(26,24,37,0.12)',
      padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
      fontFamily: "'Instrument Sans', sans-serif", whiteSpace: 'nowrap', transition: 'background 0.15s',
    }}>{children}</button>
  )
}

// ── Main page ─────────────────────────────────────────────
export default function LibraryPage() {
  // Research
  const [reports, setReports] = useState<any[]>([])
  const [reportsLimit, setReportsLimit] = useState(25)
  const [showResearchPanel, setShowResearchPanel] = useState(false)
  const [researchQuestion, setResearchQuestion] = useState('')
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchResult, setResearchResult] = useState<string | null>(null)

  // Posts
  const [posts, setPosts] = useState<any[]>([])
  const [postsLimit, setPostsLimit] = useState(25)
  const [postFilter, setPostFilter] = useState<'all' | 'sent' | 'draft' | 'error'>('all')

  // Apps
  const [apps, setApps] = useState<any[]>([])

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    const [
      { data: rData },
      { data: pData },
      { data: aData },
    ] = await Promise.all([
      supabase.from('research_reports').select('*').order('generated_at', { ascending: false }),
      supabase.from('content_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('apps').select('*').order('name'),
    ])
    if (rData) setReports(rData)
    if (pData) setPosts(pData)
    setApps(aData && aData.length > 0 ? aData : SEED_APPS)
  }

  async function runResearch() {
    if (!researchQuestion.trim()) return
    setResearchLoading(true)
    setResearchResult(null)
    try {
      const res = await fetch('/api/agents/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: researchQuestion }),
      })
      const data = await res.json()
      if (data.success) {
        setResearchResult(data.summary ?? 'Research complete! Check the report below.')
        await fetchAll()
      } else {
        setResearchResult(`Error: ${data.error ?? 'Something went wrong'}`)
      }
    } catch (e: any) {
      setResearchResult(`Error: ${e.message}`)
    } finally {
      setResearchLoading(false)
    }
  }

  const filteredPosts = posts.filter(p =>
    postFilter === 'all' ? true : p.status === postFilter
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500&display=swap');

        .lib-row {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(26,24,37,0.06);
        }
        .lib-row:last-child { border-bottom: none; }
        .lib-row:hover { background: rgba(123,104,238,0.025); }

        .lib-doc-icon {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(123,104,238,0.1); border: 1px solid rgba(123,104,238,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }

        .lib-title {
          font-size: 13.5px; font-weight: 500; color: #1A1825;
          font-family: 'Instrument Sans', sans-serif;
          margin-bottom: 3px;
        }
        .lib-meta {
          font-size: 11.5px; color: #8E8BA8;
          font-family: 'Instrument Sans', sans-serif;
        }

        .pill-btn {
          display: inline-block; font-size: 11.5px; font-weight: 500;
          padding: 5px 12px; border-radius: 100px; cursor: pointer;
          border: 1px solid rgba(26,24,37,0.1);
          background: transparent; color: #4A4760;
          font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .pill-btn:hover { background: rgba(123,104,238,0.07); border-color: rgba(123,104,238,0.25); color: #7B68EE; }
        .pill-btn.active { background: rgba(123,104,238,0.12); border-color: rgba(123,104,238,0.3); color: #7B68EE; font-weight: 600; }

        .filter-tab {
          font-size: 12.5px; font-weight: 500; padding: 6px 14px; border-radius: 8px;
          border: none; cursor: pointer; font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s, color 0.15s;
          background: transparent; color: #8E8BA8;
        }
        .filter-tab.active { background: rgba(123,104,238,0.1); color: #7B68EE; font-weight: 600; }
        .filter-tab:hover:not(.active) { background: rgba(26,24,37,0.04); color: #4A4760; }

        .app-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          padding: 16px 20px;
        }
        .app-card {
          border: 1px solid rgba(26,24,37,0.08); border-radius: 12px;
          padding: 18px; transition: box-shadow 0.2s;
        }
        .app-card:hover { box-shadow: 0 6px 24px rgba(26,24,37,0.07); }
        .app-icon {
          width: 42px; height: 42px; border-radius: 11px;
          background: rgba(123,104,238,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 12px;
        }
        .app-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 14px; font-weight: 700; color: #1A1825;
          letter-spacing: -0.01em; margin-bottom: 4px;
        }
        .app-desc {
          font-size: 12px; color: #8E8BA8; line-height: 1.5;
          font-family: 'Instrument Sans', sans-serif; margin-bottom: 14px;
        }
        .app-stats {
          display: flex; gap: 6px; flex-wrap: wrap;
          font-size: 11px; color: #8E8BA8;
          font-family: 'Instrument Sans', sans-serif;
        }
        .app-stat { background: rgba(26,24,37,0.04); border-radius: 6px; padding: 3px 8px; }

        .download-btn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 500; color: #7B68EE;
          background: rgba(123,104,238,0.08); border: 1px solid rgba(123,104,238,0.2);
          padding: 4px 10px; border-radius: 7px; cursor: pointer;
          text-decoration: none; font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .download-btn:hover { background: rgba(123,104,238,0.15); }

        .view-btn {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 500; color: #4A4760;
          background: transparent; border: 1px solid rgba(26,24,37,0.1);
          padding: 4px 10px; border-radius: 7px; cursor: pointer;
          text-decoration: none; font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .view-btn:hover { background: rgba(26,24,37,0.04); }

        .load-more {
          width: 100%; padding: 12px; font-size: 12.5px; font-weight: 500;
          color: #7B68EE; background: transparent;
          border: none; border-top: 1px solid rgba(26,24,37,0.06);
          cursor: pointer; font-family: 'Instrument Sans', sans-serif;
          transition: background 0.15s;
        }
        .load-more:hover { background: rgba(123,104,238,0.04); }

        .empty-state {
          padding: 36px 20px; text-align: center;
          font-size: 13px; color: #8E8BA8;
          font-family: 'Instrument Sans', sans-serif;
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 26, fontWeight: 800, color: '#1A1825',
          letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
        }}>Library</h1>
        <p style={{ fontSize: 12, color: '#8E8BA8', margin: '6px 0 0', fontFamily: "'Instrument Sans', sans-serif" }}>
          Everything your agents have built and produced
        </p>
      </div>

      {/* ── SECTION 1: Research Library ─────────────────── */}
      <Section
        title=" Research Library"
        subtitle="Agent-powered market research and recommendations"
        count={reports.length}
        rightSlot={
          <BtnAccent onClick={() => setShowResearchPanel(p => !p)}>
            {showResearchPanel ? ' Close' : '+ Run Research'}
          </BtnAccent>
        }
      >
        {/* Inline research panel */}
        {showResearchPanel && (
          <div style={{
            background: '#1C1A2E', padding: '24px 24px 20px',
            borderBottom: '1px solid rgba(26,24,37,0.1)',
          }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 15, fontWeight: 700, color: '#F0EEF8',
              marginBottom: 6,
            }}>What should Research Scout investigate?</div>
            <p style={{ fontSize: 12.5, color: 'rgba(240,238,248,0.55)', margin: '0 0 16px', fontFamily: "'Instrument Sans', sans-serif", lineHeight: 1.5 }}>
              Scout will search Reddit, reviews, social media, and feedback sources — then return findings with recommendations.
            </p>

            {/* Suggested pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => setResearchQuestion(q)}
                  style={{
                    fontSize: 12, fontWeight: 500, padding: '6px 13px', borderRadius: 100,
                    border: `1px solid ${researchQuestion === q ? '#7B68EE' : 'rgba(240,238,248,0.15)'}`,
                    background: researchQuestion === q ? 'rgba(123,104,238,0.25)' : 'rgba(240,238,248,0.07)',
                    color: researchQuestion === q ? '#B8ADFF' : 'rgba(240,238,248,0.65)',
                    cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
                    transition: 'all 0.15s',
                  }}
                >{q}</button>
              ))}
            </div>

            {/* Text input */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                value={researchQuestion}
                onChange={e => setResearchQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runResearch()}
                placeholder="Or type your own question..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 9,
                  border: '1px solid rgba(240,238,248,0.15)',
                  background: 'rgba(240,238,248,0.07)', color: '#F0EEF8',
                  fontSize: 13, fontFamily: "'Instrument Sans', sans-serif",
                  outline: 'none',
                }}
              />
              <button
                onClick={runResearch}
                disabled={researchLoading || !researchQuestion.trim()}
                style={{
                  padding: '10px 18px', borderRadius: 9, border: 'none',
                  background: researchLoading || !researchQuestion.trim() ? '#4A4760' : '#7B68EE',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: researchLoading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Instrument Sans', sans-serif", whiteSpace: 'nowrap',
                }}
              >{researchLoading ? 'Scout is researching...' : 'Run Scout →'}</button>
            </div>

            {/* Result */}
            {researchResult && (
              <div style={{
                marginTop: 14, padding: '12px 16px', borderRadius: 9,
                background: 'rgba(123,104,238,0.15)', border: '1px solid rgba(123,104,238,0.3)',
                fontSize: 12.5, color: '#C4BCFF', lineHeight: 1.6,
                fontFamily: "'Instrument Sans', sans-serif",
              }}>{researchResult}</div>
            )}
          </div>
        )}

        {/* Report rows */}
        {reports.length === 0 ? (
          <div className="empty-state">No research reports yet. Click "+ Run Research" to generate one.</div>
        ) : (
          <>
            {reports.slice(0, reportsLimit).map(r => {
              const genDate = new Date(r.generated_at)
              const refreshDue = r.refresh_due_at ? new Date(r.refresh_due_at) : new Date(genDate.getTime() + 90 * 86400000)
              const daysLeft = daysBetween(new Date(), refreshDue)
              const statusLabel = r.status === 'current' && daysLeft > 0 ? 'current'
                : r.status === 'running' ? 'running' : 'refresh due'

              return (
                <div key={r.id} className="lib-row">
                  <div className="lib-doc-icon"></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lib-title">{r.title}</div>
                    <div className="lib-meta">
                      Generated {genDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {daysLeft > 0
                        ? ` · Refreshes in ${daysLeft}d`
                        : ' · Refresh due'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge label={statusLabel} />
                    {r.report_url && (
                      <a href={r.report_url} download className="download-btn"> Report</a>
                    )}
                    {r.deck_url && (
                      <a href={r.deck_url} download className="download-btn"> Deck</a>
                    )}
                  </div>
                </div>
              )
            })}
            {reports.length > reportsLimit && (
              <button className="load-more" onClick={() => setReportsLimit(n => n + 25)}>
                Load more → ({reports.length - reportsLimit} remaining)
              </button>
            )}
          </>
        )}
      </Section>

      {/* ── SECTION 2: Content Posts ─────────────────────── */}
      <Section
        title=" Content Posts"
        subtitle="Everything Brand Scout has drafted or published"
        count={posts.length}
        rightSlot={
          <>
            <BtnGhost> Schedule</BtnGhost>
            <BtnAccent onClick={() => window.location.href = '/dashboard/agents'}> Write Post</BtnAccent>
          </>
        }
      >
        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: '10px 16px',
          borderBottom: '1px solid rgba(26,24,37,0.06)',
        }}>
          {(['all', 'sent', 'draft', 'error'] as const).map(tab => (
            <button
              key={tab}
              className={`filter-tab ${postFilter === tab ? 'active' : ''}`}
              onClick={() => setPostFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span style={{ marginLeft: 5, fontSize: 10.5, opacity: 0.7 }}>
                  ({posts.filter(p => p.status === tab).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            {posts.length === 0
              ? 'No content yet. Head to Agents to have Brand Scout write a post.'
              : `No ${postFilter} posts.`}
          </div>
        ) : (
          <>
            {filteredPosts.slice(0, postsLimit).map(post => {
              const platformIcons: Record<string, string> = {
                substack: '', instagram: '', linkedin: '', twitter: '𝕏',
              }
              return (
                <div key={post.id} className="lib-row" style={{ alignItems: 'center' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lib-title" style={{
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 480,
                    }}>{post.title}</div>
                    <div className="lib-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span>{platformIcons[post.platform] ?? ''} {post.platform}</span>
                      <span>·</span>
                      <span>{post.agent_name}</span>
                      <span>·</span>
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge label={post.status} />
                    {post.url || post.post_url ? (
                      <a href={post.url ?? post.post_url} target="_blank" rel="noreferrer" className="view-btn">
                        View ↗
                      </a>
                    ) : post.status === 'draft' ? (
                      <button className="view-btn">Edit</button>
                    ) : null}
                  </div>
                </div>
              )
            })}
            {filteredPosts.length > postsLimit && (
              <button className="load-more" onClick={() => setPostsLimit(n => n + 25)}>
                Load more → ({filteredPosts.length - postsLimit} remaining)
              </button>
            )}
          </>
        )}
      </Section>

      {/* ── SECTION 3: Apps Built ──────────────────────────── */}
      <Section
        title=" Apps Built"
        subtitle="Your portfolio of AI-powered apps"
        count={apps.length}
      >
        <div className="app-grid">
          {apps.map(app => (
            <div key={app.id} className="app-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', marginBottom: 10 }}>
                <Badge label={app.status} />
              </div>
              <div className="app-name">{app.name}</div>
              <div className="app-desc">{app.description}</div>
              <div className="app-stats">
                {app.downloads > 0 && (
                  <span className="app-stat">
                    {app.downloads === 1 ? '1 client' : `${app.downloads} downloads`}
                  </span>
                )}
                {app.downloads === 0 && <span className="app-stat">live</span>}
                <span className="app-stat">${typeof app.ai_cost === 'number' ? app.ai_cost.toFixed(2) : app.ai_cost}/mo AI</span>
                <span className="app-stat">{app.audience}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
