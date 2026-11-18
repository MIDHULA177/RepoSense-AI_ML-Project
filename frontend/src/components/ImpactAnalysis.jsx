import { useState } from 'react'
import { GitMerge, AlertTriangle, ArrowRight, Info, ChevronDown, ChevronUp } from 'lucide-react'

const RISK_COLOR = { High: 'var(--accent-d)', Medium: 'var(--amber)', Low: 'var(--green)' }

function ImpactCard({ result, predictions }) {
  const [open, setOpen] = useState(true)
  const riskMap = Object.fromEntries(predictions.map(p => [p.file_path, p.risk_level]))

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '13px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <GitMerge size={14} style={{ color: 'var(--accent)', flexShrink: 0 }}/>
          <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {result.changed_file}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(234,108,10,0.1)', color: 'var(--accent)', fontWeight: 700 }}>
            {result.total_affected} affected
          </span>
          {result.high_risk_affected.length > 0 && (
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(194,87,10,0.1)', color: 'var(--accent-d)', fontWeight: 700 }}>
              ⚠ {result.high_risk_affected.length} high-risk
            </span>
          )}
          {open ? <ChevronUp size={13} style={{ color: 'var(--muted)' }}/> : <ChevronDown size={13} style={{ color: 'var(--muted)' }}/>}
        </div>
      </div>

      {open && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.actions.map((action, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 13px', borderRadius: 8, background: 'rgba(234,108,10,0.05)', border: '1px solid rgba(234,108,10,0.15)' }}>
                <ArrowRight size={12} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}/>
                <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{action}</span>
              </div>
            ))}
          </div>

          {/* Direct dependents */}
          {result.direct_dependents.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 8 }}>
                Direct Dependents ({result.direct_dependents.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {result.direct_dependents.map((f, i) => {
                  const risk = riskMap[f]
                  const color = RISK_COLOR[risk] || 'var(--muted)'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text)', fontWeight: 600 }}>{f}</span>
                      {risk && <span style={{ fontSize: 11, fontWeight: 700, color }}>{risk}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Indirect dependents */}
          {result.indirect_dependents.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 8 }}>
                Indirect Dependents ({result.indirect_dependents.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.indirect_dependents.map((f, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'monospace', fontWeight: 600 }}>
                    {f.split('/').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GraphStats({ edges }) {
  const nodeSet = new Set()
  edges.forEach(e => { nodeSet.add(e.from); nodeSet.add(e.to) })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
      {[
        { label: 'Total Nodes', value: nodeSet.size, color: 'var(--blue)' },
        { label: 'Dependencies', value: edges.length, color: 'var(--accent)' },
        { label: 'Avg Connections', value: nodeSet.size > 0 ? (edges.length / nodeSet.size).toFixed(1) : 0, color: 'var(--amber)' },
      ].map(s => (
        <div key={s.label} className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-1px' }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function ImpactAnalysis({ impactAnalysis, dependencyEdges, predictions }) {
  const edges = dependencyEdges || []
  const results = impactAnalysis || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Graph stats */}
      <GraphStats edges={edges}/>

      {/* No impact analysis run yet */}
      {results.length === 0 && (
        <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(234,108,10,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Info size={24} style={{ color: 'var(--accent)' }}/>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>No Impact Analysis Run</div>
          <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
            To analyze the impact of specific file changes, include <code style={{ background: 'var(--bg2)', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12 }}>changed_files</code> in your analysis request.
          </p>
          {edges.length > 0 && (
            <div style={{ marginTop: 20, padding: '12px 20px', borderRadius: 10, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', display: 'inline-block' }}>
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                ✓ Dependency graph built — {edges.length} relationships mapped across {new Set(edges.flatMap(e => [e.from, e.to])).size} files
              </span>
            </div>
          )}
        </div>
      )}

      {/* Impact results */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <AlertTriangle size={14} style={{ color: 'var(--amber)' }}/>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Impact Analysis for {results.length} changed file{results.length > 1 ? 's' : ''}</span>
          </div>
          {results.map((r, i) => <ImpactCard key={i} result={r} predictions={predictions}/>)}
        </div>
      )}

      {/* Top connected files */}
      {edges.length > 0 && (() => {
        const inDegree = {}
        edges.forEach(e => { inDegree[e.to] = (inDegree[e.to] || 0) + 1 })
        const top = Object.entries(inDegree).sort((a, b) => b[1] - a[1]).slice(0, 8)
        return top.length > 0 ? (
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '13px 20px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
              <GitMerge size={14} style={{ color: 'var(--accent)' }}/>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Most Depended-On Files</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {top.map(([file, count], i) => {
                const risk = predictions.find(p => p.file_path === file)?.risk_level
                const color = RISK_COLOR[risk] || 'var(--muted)'
                const pct = (count / top[0][1]) * 100
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', width: 18, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text)', fontWeight: 600, minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</span>
                    <div style={{ width: 80, height: 5, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                      <div style={{ height: '100%', borderRadius: 999, background: 'var(--accent)', width: `${pct}%` }}/>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0, width: 28, textAlign: 'right' }}>{count}</span>
                    {risk && <span style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{risk}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null
      })()}
    </div>
  )
}
