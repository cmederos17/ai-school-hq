'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Types ────────────────────────────────────────────────────
type Message = {
  id: string
  role: 'user' | 'chief'
  content: string
  timestamp: Date
}

type LogItem = {
  id: string
  agent_name: string
  action: string
  output: { message?: string }
  status: 'running' | 'success' | 'error'
  created_at: string
}

// ── Constants ────────────────────────────────────────────────
const AGENT_COLOR: Record<string, string> = {
  'Chief': '#7B68EE',
  'Research Scout': '#F59E0B',
  'Brand Scout': '#10B981',
  'Lead Tracker': '#3DBFA8',
}

const ACTION_LABELS: Record<string, string> = {
  updated_research_report: 'Updated research report',
  published_to_substack: 'Published to Substack',
  morning_briefing: 'Morning briefing',
  saved_draft: 'Saved draft',
  publish_error: 'Publish failed',
  web_search: 'Web search',
  startup: 'Agent started',
  research_complete: 'Research complete',
  lead_review: 'Lead review',
  discovery_prep: 'Discovery prep',
  called_by_chief: 'Called by Chief',
  completed: 'Completed task',
  received_task: 'Received task',
  updated_research: 'Updated research',
  researching_question: 'Researching question',
  error: 'Error',
}

function humanizeAction(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dateSeparatorLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  if (d >= today) return `Today · ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  if (d >= yesterday) return `Yesterday · ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function getSmartSuggestions(logs: LogItem[]): string[] {
  const recent = logs.slice(0, 10)
  const hadBrand = recent.some(a => a.agent_name === 'Brand Scout' && a.status === 'success')
  const hadResearch = recent.some(a => a.agent_name === 'Research Scout' && a.status === 'success')
  const base = hadBrand
    ? ["Write a follow-up post about what I learned building PalmTreeFit", "Draft a Substack about my Overclock AI accelerator experience"]
    : ["Write a post about why I started building apps with AI", "Draft a Substack about the moment AI changed my teaching"]
  const r = hadResearch
    ? "Summarize the latest research for me in plain English"
    : "Update my research report with the latest stats"
  return [...base, r, "What should I post about this week?"].slice(0, 4)
}

const WELCOME: Message = {
  id: '0',
  role: 'chief',
  content: "Hey Christy  I'm your Chief. Tell me what you're working on — a post, a research question, a content idea — and I'll get the right scout on it. You'll see everything happening in real time.",
  timestamp: new Date(),
}

// ── Agent card config ────────────────────────────────────────
const AGENT_CARDS = [
  {
    name: 'Chief', status: 'Active' as const,
    desc: 'Routes your requests to the right scout and delivers your morning briefing automatically.',
    color: '#7B68EE',
  },
  {
    name: 'Research Scout', status: 'Active' as const,
    desc: 'Searches Reddit, reviews, and trends. Returns findings with specific recommendations for your business.',
    color: '#F59E0B',
  },
  {
    name: 'Brand Scout', status: 'Active' as const,
    desc: 'Drafts Substack posts and content based on what\'re building. Can post on a schedule.',
    color: '#10B981',
  },
  {
    name: 'Lead Tracker', status: 'Active' as const,
    desc: 'Reviews incoming leads, researches context, and prepares your discovery call notes.',
    color: '#3DBFA8',
  },
  {
    name: 'Social Scout', status: 'Soon' as const,
    desc: 'Will monitor social trends and surface daily content opportunities.',
    color: '#B0ADCA',
  },
]

// ── Main page ────────────────────────────────────────────────
export default function AgentsPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])
  const [logsLimit, setLogsLimit] = useState(25)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => { if (data) setLogs(data as LogItem[]) })

    const channel = supabase
      .channel('agents-log-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, (payload) => {
        setLogs(prev => [payload.new as LogItem, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function deleteMessage(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch('/api/agents/chief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'chief',
        content: data.reply || data.error || 'Something went wrong.',
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'chief',
        content: 'Hit an error — check the Mission Log.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  // Build log entries with date separators
  const visibleLogs = logs.slice(0, logsLimit)
  const logRows: ({ type: 'separator'; label: string } | { type: 'entry'; item: LogItem })[] = []
  let lastDate = ''
  for (const item of visibleLogs) {
    const dateKey = new Date(item.created_at).toDateString()
    if (dateKey !== lastDate) {
      logRows.push({ type: 'separator', label: dateSeparatorLabel(item.created_at) })
      lastDate = dateKey
    }
    logRows.push({ type: 'entry', item })
  }

  const lastMsg = messages[messages.length - 1]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500&display=swap');

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .msg-row:hover .msg-x { display: flex !important; }
        .agent-card { transition: box-shadow 0.18s, border-color 0.18s; }
        .agent-card:hover { box-shadow: 0 6px 20px rgba(26,24,37,0.10); }
        .pill-suggest {
          transition: background 0.13s, border-color 0.13s;
        }
        .pill-suggest:hover {
          background: rgba(123,104,238,0.12) !important;
          border-color: rgba(123,104,238,0.45) !important;
        }
        .log-load-more {
          width: 100%; padding: 10px;
          font-size: 12px; font-weight: 500; color: #7B68EE;
          background: transparent; border: none;
          border-top: 1px solid rgba(26,24,37,0.07);
          cursor: pointer; font-family: 'Instrument Sans', sans-serif;
          position: sticky; bottom: 0;
        }
        .log-load-more:hover { background: rgba(123,104,238,0.05); }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 26, fontWeight: 800, color: '#1A1825',
          letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
        }}>Agents</h1>
        <p style={{ fontSize: 12, color: '#8E8BA8', margin: '6px 0 0', fontFamily: "'Instrument Sans', sans-serif" }}>
          Your team running 24/7 · Mission log on the right
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Agent cards — 2×2 grid + Social Scout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {AGENT_CARDS.filter(a => a.name !== 'Social Scout').map(agent => {
              const lastSeen = logs.find(l => l.agent_name === agent.name)
              const secAgo = lastSeen ? (Date.now() - new Date(lastSeen.created_at).getTime()) / 1000 : Infinity
              const lastStr = lastSeen ? timeAgo(lastSeen.created_at) : 'No activity yet'
              return (
                <div
                  key={agent.name}
                  className="agent-card"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(26,24,37,0.08)',
                    borderRadius: 12,
                    padding: '16px 16px 14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 100,
                      background: 'rgba(34,197,94,0.1)', color: '#15803D',
                      fontFamily: "'Instrument Sans', sans-serif",
                    }}>Active</span>
                  </div>
                  <div style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 14, fontWeight: 700, color: '#1A1825',
                    marginBottom: 5, letterSpacing: '-0.01em',
                  }}>{agent.name}</div>
                  <div style={{
                    fontSize: 12, color: '#6B6888', lineHeight: 1.5,
                    fontFamily: "'Instrument Sans', sans-serif",
                    marginBottom: 10,
                  }}>{agent.desc}</div>
                  <div style={{
                    fontSize: 11, color: '#B0ADCA',
                    fontFamily: "'Instrument Sans', sans-serif",
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: secAgo < 3600 ? '#22C55E' : secAgo < 86400 ? '#F59E0B' : '#D1CEE8',
                      display: 'inline-block', flexShrink: 0,
                      animation: secAgo < 30 ? 'pulse 1.5s infinite' : 'none',
                    }} />
                    Last active {lastStr}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Social Scout — Coming Soon */}
          <div style={{
            background: 'rgba(26,24,37,0.025)',
            border: '1px dashed rgba(26,24,37,0.12)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontSize: 22, opacity: 0.5 }}></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 13.5, fontWeight: 700, color: '#8E8BA8',
                }}>Social Scout</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                  background: 'rgba(26,24,37,0.06)', color: '#B0ADCA',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}>Coming Soon</span>
              </div>
              <div style={{ fontSize: 12, color: '#B0ADCA', fontFamily: "'Instrument Sans', sans-serif" }}>
                Will monitor social trends and surface daily content opportunities.
              </div>
            </div>
          </div>

          {/* Chief Command Box */}
          <div style={{
            background: '#1C1A2E',
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Chief header */}
            <div style={{
              padding: '16px 20px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#7B68EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
              }}>C</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 14, fontWeight: 700, color: '#F0EEF8', letterSpacing: '-0.01em',
                }}>Tell Chief what you need</div>
                <div style={{ fontSize: 11.5, color: 'rgba(240,238,248,0.45)', marginTop: 2, fontFamily: "'Instrument Sans', sans-serif" }}>
                  Chief routes to the right agent
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#22C55E',
                  boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                  animation: 'pulse 2s infinite',
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 11.5, color: 'rgba(240,238,248,0.45)', fontFamily: "'Instrument Sans', sans-serif" }}>Online</span>
              </div>
            </div>

            {/* Messages area */}
            <div style={{
              height: 320, overflowY: 'auto',
              padding: '16px 20px 8px',
            }}>
              {messages.map(msg => (
                <div key={msg.id} className="msg-row" style={{ position: 'relative', marginBottom: 10 }}>
                  <div style={{
                    display: 'flex', gap: 10,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                  }}>
                    {msg.role === 'chief' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#7B68EE', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 11,
                      }}>C</div>
                    )}
                    <div style={{ maxWidth: '78%', position: 'relative' }}>
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === 'user' ? '#7B68EE' : 'rgba(255,255,255,0.08)',
                        color: msg.role === 'user' ? '#fff' : '#E8E6F5',
                        fontSize: 13.5, lineHeight: 1.6,
                        border: msg.role === 'chief' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                        fontFamily: "'Instrument Sans', sans-serif",
                      }}>{msg.content}</div>
                      {msg.id !== '0' && (
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="msg-x"
                          style={{
                            position: 'absolute', top: -6,
                            right: msg.role === 'user' ? 'auto' : -6,
                            left: msg.role === 'user' ? -6 : 'auto',
                            width: 17, height: 17, borderRadius: '50%',
                            background: '#2E2B45', border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer', fontSize: 9, color: '#8E8BA8',
                            display: 'none', alignItems: 'center', justifyContent: 'center',
                            lineHeight: 1, padding: 0,
                          }}
                        ></button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: '#7B68EE', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 11,
                  }}>C</div>
                  <div style={{
                    padding: '12px 16px', borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#7B68EE', display: 'inline-block',
                        animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Smart suggestions */}
            {lastMsg?.role === 'chief' && !loading && (
              <div style={{ padding: '0 20px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {getSmartSuggestions(logs).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="pill-suggest"
                    style={{
                      padding: '5px 11px', borderRadius: 20,
                      border: '1px solid rgba(123,104,238,0.28)',
                      background: 'rgba(123,104,238,0.1)',
                      color: '#B8ADFF', fontSize: 11.5, cursor: 'pointer',
                      fontFamily: "'Instrument Sans', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >{s}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '14px 20px 16px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  style={{
                    flex: 1, padding: '11px 15px', borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.07)', color: '#F0EEF8',
                    fontSize: 13.5, fontFamily: "'Instrument Sans', sans-serif",
                    outline: 'none', boxSizing: 'border-box',
                  }}
                  placeholder="Tell Chief what you need…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage() }}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: 'none',
                    background: input.trim() && !loading ? '#7B68EE' : 'rgba(123,104,238,0.3)',
                    color: '#fff', fontSize: 17, cursor: input.trim() && !loading ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.15s',
                  }}
                >↑</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — Mission Log ── */}
        <div style={{
          width: 280, flexShrink: 0,
          position: 'sticky', top: 28,
          maxHeight: 'calc(100vh - 56px - 56px)',
          background: '#fff',
          border: '1px solid rgba(26,24,37,0.08)',
          borderRadius: 14,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid rgba(26,24,37,0.08)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 14, fontWeight: 700, color: '#1A1825',
                }}>Mission Log</div>
                <div style={{ fontSize: 11.5, color: '#8E8BA8', marginTop: 2, fontFamily: "'Instrument Sans', sans-serif" }}>
                  Full agent history
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100,
                background: 'rgba(26,24,37,0.06)', color: '#4A4760',
                fontFamily: "'Instrument Sans', sans-serif",
              }}>{logs.length}</span>
            </div>
          </div>

          {/* Log entries */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div style={{
                padding: 32, textAlign: 'center',
                fontSize: 12.5, color: '#B0ADCA',
                fontFamily: "'Instrument Sans', sans-serif",
              }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}></div>
                No activity yet.<br />Send Chief a message to get started.
              </div>
            ) : (
              <>
                {logRows.map((row, i) => {
                  if (row.type === 'separator') {
                    return (
                      <div key={`sep-${i}`} style={{
                        padding: '8px 16px 6px',
                        fontSize: 9, fontWeight: 600, letterSpacing: '0.1em',
                        textTransform: 'uppercase', color: '#B0ADCA',
                        textAlign: 'center',
                        background: '#F8F7F5',
                        borderBottom: '1px solid rgba(26,24,37,0.05)',
                        fontFamily: "'Instrument Sans', sans-serif",
                      }}>{row.label}</div>
                    )
                  }

                  const { item } = row
                  const color = AGENT_COLOR[item.agent_name] ?? '#8E8BA8'
                  const isError = item.status === 'error'
                  const isRunning = item.status === 'running'

                  return (
                    <div key={item.id || i} style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid rgba(26,24,37,0.05)',
                    }}>
                      {/* Agent + timestamp */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                          background: isRunning ? '#F59E0B' : isError ? '#FF6B6B' : '#22C55E',
                          animation: isRunning ? 'pulse 1.5s infinite' : 'none',
                        }} />
                        <span style={{
                          fontSize: 11.5, fontWeight: 600, color,
                          fontFamily: "'Instrument Sans', sans-serif",
                          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.agent_name}</span>
                        <span style={{
                          fontSize: 10.5, color: '#C0BDDA',
                          fontFamily: "'Instrument Sans', sans-serif",
                          flexShrink: 0,
                        }}>{timeAgo(item.created_at)}</span>
                      </div>

                      {/* Action */}
                      <div style={{
                        fontSize: 12, fontWeight: 500,
                        color: isError ? '#FF6B6B' : '#1A1825',
                        fontFamily: "'Instrument Sans', sans-serif",
                        marginBottom: 2,
                      }}>{humanizeAction(item.action)}</div>

                      {/* Message */}
                      {item.output?.message && (
                        <div style={{
                          fontSize: 11.5, color: '#8E8BA8',
                          fontFamily: "'Instrument Sans', sans-serif",
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{item.output.message}</div>
                      )}
                    </div>
                  )
                })}

                {logs.length > logsLimit && (
                  <button
                    className="log-load-more"
                    onClick={() => setLogsLimit(n => n + 25)}
                  >
                    Load more → ({logs.length - logsLimit} older)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
