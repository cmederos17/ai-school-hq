'use client'

const stats = [
  { label: 'Total Revenue',      value: '$12,400', accent: false },
  { label: 'This Month',         value: '$2,100',  accent: true  },
  { label: 'Avg Course Price',   value: '$497',    accent: false },
  { label: 'Active Students',    value: '24',      accent: false },
]

const transactions = [
  { date: 'May 28, 2026', product: '10-Week AI Cohort',    amount: '$247.00', status: 'paid'    },
  { date: 'May 22, 2026', product: 'Single Topic: Agents', amount: '$49.00',  status: 'paid'    },
  { date: 'May 18, 2026', product: 'Teen Bootcamp',        amount: '$197.00', status: 'paid'    },
  { date: 'May 10, 2026', product: '10-Week AI Cohort',    amount: '$247.00', status: 'paid'    },
  { date: 'May 3, 2026',  product: 'Single Topic: Prompting', amount: '$49.00', status: 'refunded' },
]

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

export default function RevenuePage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1825', marginBottom: 6 }}>
          Revenue
        </h1>
        <p style={{ fontSize: 14, color: '#8E8BA8', fontWeight: 300 }}>
          Earnings overview and recent transactions.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.accent ? '#7B68EE' : '#FFFFFF',
            border: s.accent ? 'none' : '1px solid rgba(26,24,37,0.08)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: s.accent ? '#FFFFFF' : '#1A1825',
              marginBottom: 4,
            }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.accent ? 'rgba(255,255,255,0.7)' : '#8E8BA8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, color: '#1A1825', letterSpacing: '-0.01em' }}>
          Recent Transactions
        </h2>
      </div>
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Product', 'Amount', 'Status'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                <td style={tdStyle}>{t.date}</td>
                <td style={{ ...tdStyle, fontWeight: 500, color: '#1A1825' }}>{t.product}</td>
                <td style={{ ...tdStyle, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1A1825' }}>{t.amount}</td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
                    background: t.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: t.status === 'paid' ? '#16A34A' : '#DC2626',
                  }}>
                    {t.status === 'paid' ? ' Paid' : '↩ Refunded'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
