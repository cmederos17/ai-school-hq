'use client'

const apps = [
  {
    name: 'PalmTreeFit',
    calls: 2100,
    cost: 4.20,
    status: 'under',
    updated: 'Jun 1, 2026',
  },
  {
    name: 'AI School HQ',
    calls: 9800,
    cost: 18.50,
    status: 'approaching',
    updated: 'Jun 1, 2026',
  },
  {
    name: 'GoldRush Allstars',
    calls: 890,
    cost: 1.80,
    status: 'under',
    updated: 'Jun 1, 2026',
  },
]

const totalMonthlyCost = apps.reduce((sum, a) => sum + a.cost, 0)

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  under:      { bg: 'rgba(34,197,94,0.1)',  color: '#16A34A', label: ' Under threshold' },
  approaching:{ bg: 'rgba(245,158,11,0.1)', color: '#D97706', label: ' Approaching limit' },
  over:       { bg: 'rgba(239,68,68,0.1)',  color: '#DC2626', label: ' Over threshold' },
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 12,
  border: '1px solid rgba(26,24,37,0.08)',
  overflow: 'hidden',
}

const thStyle: React.CSSProperties = {
  padding: '12px 20px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#8E8BA8',
  borderBottom: '1px solid rgba(26,24,37,0.08)',
  background: '#FAFAF9',
}

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: 13.5,
  color: '#4A4760',
  borderBottom: '1px solid rgba(26,24,37,0.06)',
  verticalAlign: 'middle',
}

export default function CostsPage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1825', marginBottom: 6 }}>
          AI Costs
        </h1>
        <p style={{ fontSize: 14, color: '#8E8BA8', fontWeight: 300 }}>
          Monthly API usage and cost tracking across your apps.
        </p>
      </div>

      {/* Summary card */}
      <div style={{ background: '#1C1A2E', borderRadius: 12, padding: '28px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(240,238,248,0.45)', marginBottom: 8 }}>
            Total Monthly AI Cost
          </div>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 48, fontWeight: 800, color: '#7B68EE', letterSpacing: '-0.03em', lineHeight: 1 }}>
            ${totalMonthlyCost.toFixed(2)}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(240,238,248,0.45)', marginTop: 8 }}>
            Across {apps.length} apps · {apps.reduce((s, a) => s + a.calls, 0).toLocaleString()} total API calls
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {apps.map(a => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(240,238,248,0.55)' }}>{a.name}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                background: statusConfig[a.status].bg,
                color: statusConfig[a.status].color,
              }}>${a.cost.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Apps table */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['App Name', 'Monthly API Calls', 'Est. Cost', 'Status', 'Last Updated'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apps.map((app, i) => {
              const sc = statusConfig[app.status]
              return (
                <tr key={app.name} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#1A1825' }}>{app.name}</td>
                  <td style={tdStyle}>{app.calls.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1A1825', fontSize: 15 }}>
                    ${app.cost.toFixed(2)}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: '0.03em',
                      background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={tdStyle}>{app.updated}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
