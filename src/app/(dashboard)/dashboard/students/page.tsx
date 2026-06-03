'use client'

const students = [
  { name: 'Maria Gonzalez',  email: 'maria@example.com',    track: '10-Week AI Cohort',      progress: 72, enrolled: 'Apr 2, 2026',  status: 'active' },
  { name: 'James Whitfield', email: 'james@example.com',    track: 'AI Bootcamp for Teens',  progress: 100, enrolled: 'Mar 10, 2026', status: 'completed' },
  { name: 'Priya Nair',      email: 'priya@example.com',    track: 'Single Topic Courses',   progress: 45, enrolled: 'May 1, 2026',  status: 'active' },
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

export default function StudentsPage() {
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1825', marginBottom: 6 }}>
          Students
        </h1>
        <p style={{ fontSize: 14, color: '#8E8BA8', fontWeight: 300 }}>
          All enrolled students across your programs.
        </p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Enrolled', value: students.length },
          { label: 'Active', value: students.filter(s => s.status === 'active').length },
          { label: 'Completed', value: students.filter(s => s.status === 'completed').length },
        ].map(chip => (
          <div key={chip.label} style={{ background: '#FFFFFF', border: '1px solid rgba(26,24,37,0.08)', borderRadius: 10, padding: '12px 20px', minWidth: 110 }}>
            <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: '#1A1825', letterSpacing: '-0.02em' }}>{chip.value}</div>
            <div style={{ fontSize: 12, color: '#8E8BA8', marginTop: 2 }}>{chip.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Email', 'Track', 'Progress', 'Enrolled Date', 'Status'].map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.email} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF9' }}>
                <td style={{ ...tdStyle, fontWeight: 500, color: '#1A1825' }}>{s.name}</td>
                <td style={tdStyle}>{s.email}</td>
                <td style={tdStyle}>{s.track}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: 'rgba(26,24,37,0.08)', borderRadius: 100, overflow: 'hidden', minWidth: 80 }}>
                      <div style={{ height: '100%', width: `${s.progress}%`, background: s.progress === 100 ? '#22C55E' : '#7B68EE', borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#4A4760', minWidth: 32 }}>{s.progress}%</span>
                  </div>
                </td>
                <td style={tdStyle}>{s.enrolled}</td>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
                    background: s.status === 'completed' ? 'rgba(34,197,94,0.1)' : 'rgba(123,104,238,0.1)',
                    color: s.status === 'completed' ? '#16A34A' : '#7B68EE',
                  }}>
                    {s.status === 'completed' ? ' Completed' : '● Active'}
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
