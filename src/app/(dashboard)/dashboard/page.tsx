'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const TOTAL_AGENTS = 6

export default function CommandCenter() {
  const [now, setNow] = useState(new Date())
  const [logs, setLogs] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [aiUsage, setAiUsage] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])

  const [briefingState, setBriefingState] = useState<'idle' | 'loading' | 'playing'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('command-center')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_logs' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchAll)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchAll() {
    const since24h = new Date(Date.now() - 86400000).toISOString()
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

    const [
      { data: logData },
      { data: leadData },
      { data: reportData },
      { data: usageData },
      { data: studentData },
      { data: revenueData },
    ] = await Promise.all([
      supabase.from('agent_logs').select('*').gte('created_at', since24h).order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('research_reports').select('id').limit(100),
      supabase.from('ai_usage').select('estimated_cost, status, app_name').gte('created_at', startOfMonth),
      supabase.from('students').select('id').limit(200),
      supabase.from('revenue').select('amount').gte('created_at', startOfMonth),
    ])

    if (logData) setLogs(logData)
    if (leadData) setLeads(leadData)
    if (reportData) setReports(reportData)
    if (usageData) setAiUsage(usageData)
    if (studentData) setStudents(studentData)
    if (revenueData) setRevenue(revenueData)
  }

  // ── Derived stats ────────────────────────────────────────
  const activeAgents = new Set(logs.map(l => l.agent_name)).size
  const missionLogs = logs.length
  const openLeads = leads.filter(l => l.status === 'new' || l.status === 'contacted').length
  const newToday = leads.filter(l => {
    const today = new Date(); today.setHours(0,0,0,0)
    return l.status === 'new' && new Date(l.created_at) >= today
  }).length
  const monthlyCost = aiUsage.reduce((sum, r) => sum + (r.estimated_cost ?? 0), 0)
  const revenueThisMonth = revenue.reduce((sum, r) => sum + (r.amount ?? 0), 0)

  // ── Needs Attention items ────────────────────────────────
  const attentionItems: { title: string; desc: string; badge: string; badgeColor: string }[] = []

  logs.filter(l => l.status === 'error').forEach(l => {
    attentionItems.push({
      title: `${l.agent_name} error`,
      desc: l.output?.message ?? l.action,
      badge: 'error',
      badgeColor: '#FF6B6B',
    })
  })

  leads.filter(l => l.status === 'new').forEach(l => {
    attentionItems.push({
      title: l.name ?? 'New Lead',
      desc: `${l.what_they_want ?? 'Needs follow-up'} · via ${l.source ?? 'unknown'}`,
      badge: 'new lead',
      badgeColor: '#F5A623',
    })
  })

  aiUsage.filter(u => u.status === 'approaching').forEach(u => {
    attentionItems.push({
      title: `${u.app_name} cost alert`,
      desc: `Approaching limit — $${(u.estimated_cost ?? 0).toFixed(2)} this month`,
      badge: 'review',
      badgeColor: '#7B68EE',
    })
  })

  // ── Quick link tiles ─────────────────────────────────────
  const quickLinks = [
    { href: '/dashboard/agents', label: 'Agents', value: `${activeAgents} active` },
    { href: '/dashboard/library', label: 'Library', value: `${reports.length} reports` },
    { href: '/dashboard/leads', label: 'Leads', value: `${openLeads} open` },
    { href: '/dashboard/students', label: 'Students', value: `${students.length} enrolled` },
    { href: '/dashboard/revenue', label: 'Revenue', value: `$${revenueThisMonth.toLocaleString()} this month` },
    { href: '/dashboard/costs', label: 'AI Costs', value: `$${monthlyCost.toFixed(2)} est.` },
  ]

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  async function requestVoiceBriefing() {
    if (briefingState !== 'idle') return
    setBriefingState('loading')

    try {
      const res = await fetch('/api/voice/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeAgents,
          missionLogs,
          openLeads,
          newToday,
          monthlyCost,
          attentionItems,
          students: students.length,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Voice briefing error:', err)
        setBriefingState('idle')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setBriefingState('idle')
        URL.revokeObjectURL(url)
      }
      audio.onerror = () => {
        setBriefingState('idle')
        URL.revokeObjectURL(url)
      }

      setBriefingState('playing')
      audio.play()
    } catch (e) {
      console.error('Voice briefing failed:', e)
      setBriefingState('idle')
    }
  }

  function stopBriefing() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setBriefingState('idle')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500&display=swap');

        .cc-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .cc-stat {
          background: #fff;
          border: 1px solid rgba(26,24,37,0.08);
          border-radius: 12px;
          padding: 20px 22px;
          border-left-width: 3px;
        }
        .cc-stat-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #8E8BA8;
          margin-bottom: 10px;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cc-stat-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .cc-stat-sub {
          font-size: 12px;
          color: #8E8BA8;
          font-family: 'Instrument Sans', sans-serif;
        }

        .cc-two-col {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 14px;
        }
        .cc-card {
          background: #fff;
          border: 1px solid rgba(26,24,37,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .cc-card-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(26,24,37,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cc-card-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #1A1825;
          letter-spacing: -0.01em;
        }
        .cc-card-subtitle {
          font-size: 12px;
          color: #8E8BA8;
          margin-top: 2px;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cc-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 100px;
          background: rgba(26,24,37,0.06);
          color: #4A4760;
          font-family: 'Instrument Sans', sans-serif;
        }

        .cc-attention-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(26,24,37,0.06);
        }
        .cc-attention-item:last-child { border-bottom: none; }
        .cc-attention-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(26,24,37,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .cc-attention-title {
          font-size: 13px;
          font-weight: 500;
          color: #1A1825;
          margin-bottom: 2px;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cc-attention-desc {
          font-size: 11.5px;
          color: #8E8BA8;
          line-height: 1.4;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cc-attention-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
          color: white;
          margin-left: auto;
          flex-shrink: 0;
          align-self: flex-start;
          margin-top: 2px;
          font-family: 'Instrument Sans', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cc-clear {
          padding: 36px 20px;
          text-align: center;
          font-size: 13px;
          color: #8E8BA8;
          font-family: 'Instrument Sans', sans-serif;
        }

        .cc-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        .cc-quick-tile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          text-decoration: none;
          border-right: 1px solid rgba(26,24,37,0.08);
          border-bottom: 1px solid rgba(26,24,37,0.08);
          transition: background 0.15s;
        }
        .cc-quick-tile:nth-child(even) { border-right: none; }
        .cc-quick-tile:nth-last-child(-n+2) { border-bottom: none; }
        .cc-quick-tile:hover { background: rgba(123,104,238,0.04); }
        .cc-quick-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(26,24,37,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .cc-quick-label {
          font-size: 12px;
          font-weight: 500;
          color: #1A1825;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cc-quick-value {
          font-size: 11px;
          color: #8E8BA8;
          margin-top: 1px;
          font-family: 'Instrument Sans', sans-serif;
        }

        .cc-topbar-sub {
          font-size: 12px;
          color: #8E8BA8;
          margin-top: 2px;
          font-family: 'Instrument Sans', sans-serif;
        }

        .cc-voice-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 100px;
          border: 1.5px solid rgba(123,104,238,0.25);
          background: rgba(123,104,238,0.06);
          color: #7B68EE;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Instrument Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .cc-voice-btn:hover:not(:disabled) {
          background: rgba(123,104,238,0.12);
          border-color: rgba(123,104,238,0.4);
        }
        .cc-voice-btn:disabled {
          cursor: default;
        }
        .cc-voice-btn.loading {
          color: #8E8BA8;
          border-color: rgba(142,139,168,0.2);
          background: rgba(142,139,168,0.06);
        }
        .cc-voice-btn.playing {
          color: #FF6B6B;
          border-color: rgba(255,107,107,0.3);
          background: rgba(255,107,107,0.07);
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse-dot 1.2s ease-in-out infinite;
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 26, fontWeight: 800, color: '#1A1825', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1 }}>
            Command Center
          </h1>
          <p className="cc-topbar-sub">
            Last updated · {timeStr} · {activeAgents} agent{activeAgents !== 1 ? 's' : ''} active
          </p>
        </div>

        {/* Voice Briefing button */}
        {briefingState === 'idle' && (
          <button className="cc-voice-btn" onClick={requestVoiceBriefing}>
            <span>🎙</span>
            Voice Briefing
          </button>
        )}
        {briefingState === 'loading' && (
          <button className="cc-voice-btn loading" disabled>
            <span style={{ fontSize: 11 }}>⏳</span>
            Preparing briefing…
          </button>
        )}
        {briefingState === 'playing' && (
          <button className="cc-voice-btn playing" onClick={stopBriefing}>
            <span className="pulse-dot" />
            Stop briefing
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div className="cc-stat-grid">
        <div className="cc-stat" style={{ borderLeftColor: '#7B68EE' }}>
          <div className="cc-stat-label">Active Agents</div>
          <div className="cc-stat-value" style={{ color: '#7B68EE' }}>{activeAgents}</div>
          <div className="cc-stat-sub">of {TOTAL_AGENTS} total</div>
        </div>
        <div className="cc-stat" style={{ borderLeftColor: '#3DBFA8' }}>
          <div className="cc-stat-label">Mission Logs</div>
          <div className="cc-stat-value" style={{ color: '#3DBFA8' }}>{missionLogs}</div>
          <div className="cc-stat-sub">last 24h</div>
        </div>
        <div className="cc-stat" style={{ borderLeftColor: '#F5A623' }}>
          <div className="cc-stat-label">Open Leads</div>
          <div className="cc-stat-value" style={{ color: '#F5A623' }}>{openLeads}</div>
          <div className="cc-stat-sub">{newToday} new today</div>
        </div>
        <div className="cc-stat" style={{ borderLeftColor: '#FF6B6B' }}>
          <div className="cc-stat-label">Monthly AI Cost</div>
          <div className="cc-stat-value" style={{ color: '#FF6B6B' }}>
            ${monthlyCost > 0 ? monthlyCost.toFixed(2) : '—'}
          </div>
          <div className="cc-stat-sub">est. this month</div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="cc-two-col">

        {/* Left — Needs Attention */}
        <div className="cc-card">
          <div className="cc-card-header">
            <div>
              <div className="cc-card-title">Needs Attention</div>
              <div className="cc-card-subtitle">Items requiring your action</div>
            </div>
            {attentionItems.length > 0 && (
              <span className="cc-badge">{attentionItems.length}</span>
            )}
          </div>

          {attentionItems.length === 0 ? (
            <div className="cc-clear">All clear — nothing needs your attention right now </div>
          ) : (
            attentionItems.map((item, i) => (
              <div key={i} className="cc-attention-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cc-attention-title">{item.title}</div>
                  <div className="cc-attention-desc">{item.desc}</div>
                </div>
                <span
                  className="cc-attention-badge"
                  style={{ background: item.badgeColor }}
                >
                  {item.badge}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right — Quick Links */}
        <div className="cc-card">
          <div className="cc-card-header">
            <div>
              <div className="cc-card-title">Quick Links</div>
              <div className="cc-card-subtitle">Jump to any section</div>
            </div>
          </div>
          <div className="cc-quick-grid">
            {quickLinks.map(tile => (
              <Link key={tile.href} href={tile.href} className="cc-quick-tile">
                <div>
                  <div className="cc-quick-label">{tile.label}</div>
                  <div className="cc-quick-value">{tile.value}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
