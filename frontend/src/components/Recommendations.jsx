import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react'

const RISK_CONFIG = {
  High:   { color: 'var(--accent-d)', bg: 'rgba(194,87,10,0.06)',  dot: '🔴' },
  Medium: { color: 'var(--amber)',    bg: 'rgba(180,83,9,0.06)',   dot: '🟡' },
  Low:    { color: 'var(--green)',    bg: 'rgba(21,128,61,0.06)',  dot: '🟢' },
}

function CardHeader({ icon, title, desc }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{desc}</div>}
      </div>
    </div>
  )
}

export default function Recommendations({ predictions, recommendations }) {
  const top10    = predictions.slice(0, 10)
  const highRisk = predictions.filter(p => p.risk_level === 'High').slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Risk Priority Ranking */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <CardHeader
          icon={<TrendingUp size={16} style={{ color: 'var(--accent)' }}/>}
          title="Risk Priority Ranking"
          desc="Files sorted by predicted defect risk — inspect these first"
        />
        <div>
          {top10.map((file, i) => {
            const cfg  = RISK_CONFIG[file.risk_level]
            const name = file.file_path.split('/').pop()
            return (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: i < top10.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'rgba(234,108,10,0.02)' : 'transparent', transition: 'background 0.12s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(234,108,10,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(234,108,10,0.02)' : 'transparent'}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? 'rgba(234,108,10,0.1)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: i < 3 ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{file.file_path}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 260 }}>
                  {(file.risk_factors || []).slice(0, 2).map((f, j) => (
                    <span key={j} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(234,108,10,0.08)', color: 'var(--accent)', border: '1px solid rgba(234,108,10,0.18)', fontWeight: 600 }}>
                      {f.label.split('(')[0].trim()}
                    </span>
                  ))}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: cfg.color, letterSpacing: '-0.5px' }}>{(file.bug_probability * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, marginTop: 2 }}>{cfg.dot} {file.risk_level}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <CardHeader
          icon={<Lightbulb size={16} style={{ color: 'var(--amber)' }}/>}
          title="Recommendations"
          desc="Actionable suggestions based on the analysis"
        />
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(recommendations || []).length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 0' }}>No recommendations available.</p>
          ) : recommendations.map((rec, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(234,108,10,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--accent)' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Factor Breakdown */}
      {highRisk.length > 0 && (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <CardHeader
            icon={<AlertTriangle size={16} style={{ color: 'var(--accent-d)' }}/>}
            title="Risk Factor Breakdown"
            desc="Why each high-risk file received its score"
          />
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {highRisk.map((file, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 8, border: '1px solid rgba(194,87,10,0.2)', background: 'rgba(194,87,10,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{file.file_path.split('/').pop()}</span>
                  <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--accent-d)' }}>{(file.bug_probability * 100).toFixed(0)}% HIGH</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(file.risk_factors || []).length > 0
                    ? file.risk_factors.map((f, j) => (
                        <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: 'rgba(234,108,10,0.08)', color: 'var(--accent)', border: '1px solid rgba(234,108,10,0.18)', fontWeight: 600 }}>
                          ✓ {f.label}
                        </span>
                      ))
                    : <span style={{ fontSize: 12, color: 'var(--muted)' }}>No specific risk factors identified</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
