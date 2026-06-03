'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// ── Types ──────────────────────────────────────────────────
interface Lead {
  id: string
  name: string
  what_they_want?: string
  source?: string
  status: 'new' | 'contacted' | 'proposal' | 'closed'
  agent_note?: string
  created_at: string
}

// ── Columns config ──────────────────────────────────────────
const COLUMNS: { key: Lead['status']; label: string; accent: string }[] = [
  { key: 'new',       label: 'New',           accent: '#7B68EE' },
  { key: 'contacted', label: 'Contacted',     accent: '#3DBFA8' },
  { key: 'proposal',  label: 'Proposal Sent', accent: '#F5A623' },
  { key: 'closed',    label: 'Closed',        accent: '#22C55E' },
]

// ── Seed data ───────────────────────────────────────────────
const SEED_LEADS: Omit<Lead, 'id' | 'created_at'>[] = [
  {
    name: 'Restaurant Contact',
    what_they_want: 'Build a custom app for their restaurant',
    source: 'direct outreach',
    status: 'new',
    agent_note: 'Discovery prep ready',
  },
  {
    name: 'Realtor Contact',
    what_they_want: 'Build a custom app for real estate',
    source: 'direct outreach',
    status: 'new',
    agent_note: 'Discovery prep ready',
  },
  {
    name: 'IG Follower',
    what_they_want: 'Interested in PalmTreeFit premium version',
    source: 'Instagram reel',
    status: 'contacted',
    agent_note: 'DM sent Jun 1 · awaiting reply',
  },
]

// ── Add Lead modal ──────────────────────────────────────────
function AddLeadModal({
  defaultStatus,
  onClose,
  onSave,
}: {
  defaultStatus: Lead['status']
  onClose: () => void
  onSave: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [want, setWant] = useState('')
  const [source, setSource] = useState('')
  const [status, setStatus] = useState<Lead['status']>(defaultStatus)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSave({ name: name.trim(), what_they_want: want, source, status, agent_note: note })
    setSaving(false)
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,24,37,0.4)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '28px 28px 24px',
          width: '100%', maxWidth: 440,
          boxShadow: '0 24px 64px rgba(26,24,37,0.18)',
        }}
      >
        <div style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 17, fontWeight: 700, color: '#1A1825', marginBottom: 20,
        }}>+ Add Lead</div>

        {[
          { label: 'Name *', value: name, set: setName, placeholder: 'Contact or company name' },
          { label: 'What they want', value: want, set: setWant, placeholder: 'e.g. Build a restaurant app' },
          { label: 'Source', value: source, set: setSource, placeholder: 'e.g. Instagram, direct outreach' },
          { label: 'Agent note', value: note, set: setNote, placeholder: 'e.g. Discovery call scheduled' },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: '#8E8BA8', display: 'block', marginBottom: 5, fontFamily: "'Instrument Sans', sans-serif" }}>
              {f.label}
            </label>
            <input
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: 8,
                border: '1px solid rgba(26,24,37,0.12)',
                fontSize: 13, fontFamily: "'Instrument Sans', sans-serif",
                color: '#1A1825', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11.5, fontWeight: 500, color: '#8E8BA8', display: 'block', marginBottom: 5, fontFamily: "'Instrument Sans', sans-serif" }}>
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Lead['status'])}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 8,
              border: '1px solid rgba(26,24,37,0.12)',
              fontSize: 13, fontFamily: "'Instrument Sans', sans-serif",
              color: '#1A1825', background: '#fff', outline: 'none',
            }}
          >
            <option value="new"> New</option>
            <option value="contacted"> Contacted</option>
            <option value="proposal"> Proposal Sent</option>
            <option value="closed"> Closed</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(26,24,37,0.12)',
              background: 'transparent', fontSize: 13, fontWeight: 500, color: '#4A4760',
              cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: saving || !name.trim() ? '#B0AAD8' : '#7B68EE',
              fontSize: 13, fontWeight: 600, color: '#fff',
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          >{saving ? 'Saving…' : 'Add Lead'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Lead card ────────────────────────────────────────────────
function LeadCard({ lead, accentColor, onMove }: { lead: Lead; accentColor: string; onMove: (id: string, status: Lead['status']) => void }) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const dateStr = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      style={{
        background: '#fff',
        border: `1px solid ${hovered ? accentColor : 'rgba(26,24,37,0.08)'}`,
        borderRadius: 12,
        padding: '14px 14px 12px',
        cursor: 'default',
        boxShadow: hovered ? `0 6px 20px rgba(26,24,37,0.10)` : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {/* Move menu trigger */}
      {hovered && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <button
            onClick={() => setMenuOpen(m => !m)}
            style={{
              fontSize: 13, background: 'rgba(26,24,37,0.05)', border: 'none',
              borderRadius: 6, padding: '2px 7px', cursor: 'pointer', color: '#8E8BA8',
            }}
          >···</button>
          {menuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: '#fff', border: '1px solid rgba(26,24,37,0.10)',
              borderRadius: 10, overflow: 'hidden', zIndex: 10,
              boxShadow: '0 8px 24px rgba(26,24,37,0.12)', minWidth: 150,
            }}>
              {COLUMNS.filter(c => c.key !== lead.status).map(c => (
                <button
                  key={c.key}
                  onClick={() => { onMove(lead.id, c.key); setMenuOpen(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '9px 14px', fontSize: 12.5, fontWeight: 500,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: '#1A1825', fontFamily: "'Instrument Sans', sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123,104,238,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Move to {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Name */}
      <div style={{
        fontSize: 13, fontWeight: 600, color: '#1A1825',
        fontFamily: "'Instrument Sans', sans-serif",
        marginBottom: 5, paddingRight: hovered ? 28 : 0,
      }}>{lead.name}</div>

      {/* What they want */}
      {lead.what_they_want && (
        <div style={{
          fontSize: 11.5, color: '#6B6888', lineHeight: 1.45,
          fontFamily: "'Instrument Sans', sans-serif",
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: 10,
        }}>{lead.what_they_want}</div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {lead.source && (
          <span style={{
            fontSize: 10.5, fontWeight: 500, padding: '2px 8px', borderRadius: 100,
            background: 'rgba(26,24,37,0.05)', color: '#8E8BA8',
            fontFamily: "'Instrument Sans', sans-serif",
          }}>{lead.source}</span>
        )}
        <span style={{ fontSize: 10.5, color: '#B0ABCC', fontFamily: "'Instrument Sans', sans-serif", marginLeft: 'auto' }}>
          {dateStr}
        </span>
      </div>

      {/* Agent note */}
      {lead.agent_note && (
        <div style={{
          marginTop: 9, paddingTop: 9,
          borderTop: '1px solid rgba(26,24,37,0.06)',
          fontSize: 11, color: accentColor,
          fontFamily: "'Instrument Sans', sans-serif",
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span></span>
          <span>{lead.agent_note}</span>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [modalStatus, setModalStatus] = useState<Lead['status'] | null>(null)

  useEffect(() => {
    fetchLeads()
    const channel = supabase
      .channel('leads-crm')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) { setLoading(false); return }

    if (!data || data.length === 0) {
      // Seed
      const { data: seeded } = await supabase
        .from('leads')
        .insert(SEED_LEADS.map(l => ({ ...l, created_at: new Date().toISOString() })))
        .select()
      setLeads((seeded ?? []) as Lead[])
    } else {
      setLeads(data as Lead[])
    }
    setLoading(false)
  }

  async function addLead(lead: Omit<Lead, 'id' | 'created_at'>) {
    const { data } = await supabase
      .from('leads')
      .insert({ ...lead, created_at: new Date().toISOString() })
      .select()
      .single()
    if (data) setLeads(prev => [data as Lead, ...prev])
  }

  async function moveLead(id: string, newStatus: Lead['status']) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
    await supabase.from('leads').update({ status: newStatus }).eq('id', id)
  }

  const totalOpen = leads.filter(l => l.status !== 'closed').length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Instrument+Sans:wght@300;400;500&display=swap');

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          align-items: start;
        }

        .kanban-col {
          background: #EDEAE4;
          border-radius: 14px;
          padding: 14px;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .kanban-col-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 2px;
        }

        .kanban-col-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #1A1825;
          flex: 1;
        }

        .kanban-count {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 100px;
          background: rgba(26,24,37,0.08);
          color: #4A4760;
          font-family: 'Instrument Sans', sans-serif;
        }

        .kanban-add-btn {
          width: 100%;
          padding: 10px;
          border: 1.5px dashed rgba(26,24,37,0.18);
          border-radius: 10px;
          background: transparent;
          font-size: 12px;
          font-weight: 500;
          color: #8E8BA8;
          cursor: pointer;
          font-family: 'Instrument Sans', sans-serif;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          margin-top: auto;
        }
        .kanban-add-btn:hover {
          border-color: #7B68EE;
          color: #7B68EE;
          background: rgba(123,104,238,0.05);
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: 26, fontWeight: 800, color: '#1A1825',
            letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
          }}>Leads / CRM</h1>
          <p style={{ fontSize: 12, color: '#8E8BA8', margin: '6px 0 0', fontFamily: "'Instrument Sans', sans-serif" }}>
            Lead Tracker manages and moves leads automatically · {totalOpen} open
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => {
              const rows = leads.map(l => `${l.name},${l.status},${l.source ?? ''},${l.what_they_want ?? ''}`)
              const csv = ['Name,Status,Source,What They Want', ...rows].join('\n')
              const a = document.createElement('a'); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
              a.download = 'leads.csv'; a.click()
            }}
            style={{
              padding: '8px 16px', borderRadius: 9,
              border: '1px solid rgba(26,24,37,0.12)',
              background: 'transparent', fontSize: 13, fontWeight: 500, color: '#4A4760',
              cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
            }}
          >Export</button>
          <button
            onClick={() => setModalStatus('new')}
            style={{
              padding: '8px 16px', borderRadius: 9, border: 'none',
              background: '#7B68EE', fontSize: 13, fontWeight: 600, color: '#fff',
              cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif",
            }}
          >+ Add Lead</button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#8E8BA8', fontFamily: "'Instrument Sans', sans-serif", fontSize: 13 }}>
          Loading leads…
        </div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colLeads = leads.filter(l => l.status === col.key)
            return (
              <div key={col.key} className="kanban-col">
                {/* Column header */}
                <div className="kanban-col-header">
                  <span className="kanban-col-title">{col.label}</span>
                  <span className="kanban-count">{colLeads.length}</span>
                </div>

                {/* Cards */}
                {colLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    accentColor={col.accent}
                    onMove={moveLead}
                  />
                ))}

                {/* Add button */}
                <button
                  className="kanban-add-btn"
                  onClick={() => setModalStatus(col.key)}
                >
                  + Add lead
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Lead modal */}
      {modalStatus && (
        <AddLeadModal
          defaultStatus={modalStatus}
          onClose={() => setModalStatus(null)}
          onSave={addLead}
        />
      )}
    </>
  )
}
