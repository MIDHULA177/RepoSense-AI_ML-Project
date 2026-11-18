import { useState, useMemo } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Search, ArrowUpDown } from 'lucide-react'

const RISK_CONFIG = {
  High:   { color: 'var(--accent-d)', bg: 'rgba(194,87,10,0.06)',  icon: <AlertTriangle size={11}/> },
  Medium: { color: 'var(--amber)',    bg: 'rgba(180,83,9,0.06)',   icon: <AlertCircle size={11}/> },
  Low:    { color: 'var(--green)',    bg: 'rgba(21,128,61,0.06)',  icon: <CheckCircle size={11}/> },
}

function RiskBadge({ level }) {
  const c = RISK_CONFIG[level]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}>
      {c.icon}{level}
    </span>
  )
}

function ProbBar({ value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: color, width: `${value * 100}%`, transition: 'width 0.4s ease' }}/>
      </div>
      <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color }}>{(value * 100).toFixed(1)}%</span>
    </div>
  )
}

function FileRow({ file }) {
  const [open, setOpen] = useState(false)
  const c = RISK_CONFIG[file.risk_level]
  return (
    <>
      <tr style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', background: open ? c.bg : 'transparent', transition: 'background 0.15s' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(234,108,10,0.03)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
        onClick={() => setOpen(o => !o)}>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{file.file_path.split('/').pop()}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{file.file_path}</div>
        </td>
        <td style={{ padding: '12px 16px' }}><RiskBadge level={file.risk_level}/></td>
        <td style={{ padding: '12px 16px' }}><ProbBar value={file.bug_probability} color={c.color}/></td>
        <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)', fontWeight: 600 }}>{file.loc}</td>
        <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)', fontWeight: 600 }}>{file.avg_complexity?.toFixed(1)}</td>
        <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)', fontWeight: 600 }}>{file.commit_count}</td>
        <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)', fontWeight: 600 }}>{file.churn}</td>
        <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{open ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}</td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} style={{ padding: '16px 20px', background: c.bg, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Insight */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: c.color, fontWeight: 500 }}>
                <span>💡</span><span>{file.insight}</span>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { label: 'Lines of Code',   value: file.loc },
                  { label: 'Complexity',      value: file.avg_complexity?.toFixed(2) },
                  { label: 'Commits',         value: file.commit_count },
                  { label: 'Churn',           value: file.churn },
                  { label: 'Contributors',    value: file.contributor_count },
                  { label: 'Bug Probability', value: `${(file.bug_probability * 100).toFixed(1)}%` },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{m.label}</div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Risk factors */}
              {file.risk_factors?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {file.risk_factors.map((rf, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'var(--card)', border: `1px solid ${c.color}40`, color: c.color, fontWeight: 600 }}>
                      ⚠ {rf.factor ?? rf}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function SortTh({ label, k, sortKey, onSort }) {
  const active = sortKey === k
  return (
    <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', userSelect: 'none', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}
      onClick={() => onSort(k)}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label}<ArrowUpDown size={9}/></span>
    </th>
  )
}

export default function RiskTable({ predictions, counts }) {
  const [filter, setFilter]   = useState('All')
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState('bug_probability')
  const [sortDir, setSortDir] = useState('desc')

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let data = filter === 'All' ? predictions : predictions.filter(p => p.risk_level === filter)
    if (search) data = data.filter(p => p.file_path.toLowerCase().includes(search.toLowerCase()))
    return [...data].sort((a, b) => {
      const v = sortDir === 'asc' ? 1 : -1
      return (a[sortKey] > b[sortKey] ? 1 : -1) * v
    })
  }, [predictions, filter, search, sortKey, sortDir])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'High Risk',   count: counts.high,   color: 'var(--accent-d)', bg: 'rgba(194,87,10,0.06)'  },
          { label: 'Medium Risk', count: counts.medium, color: 'var(--amber)',    bg: 'rgba(180,83,9,0.06)'   },
          { label: 'Low Risk',    count: counts.low,    color: 'var(--green)',    bg: 'rgba(21,128,61,0.06)'  },
        ].map(c => (
          <div key={c.label} style={{ padding: '20px 24px', borderRadius: 12, border: '1px solid var(--border)', background: c.bg, textAlign: 'center', boxShadow: '0 2px 8px var(--shadow-sm)' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: c.color, letterSpacing: '-1px' }}>{c.count}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{c.label} Files</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 8 }}>
          <Search size={13} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit' }}/>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['All','High','Medium','Low'].map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border2)', background: filter === t ? 'var(--accent)' : 'var(--card)', color: filter === t ? '#fff' : 'var(--muted)', transition: 'all 0.15s', boxShadow: filter === t ? '0 2px 8px var(--glow-sm)' : 'none' }}>
              {t}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{filtered.length} files</span>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>File</th>
              <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>Risk</th>
              <SortTh label="Bug Prob." k="bug_probability" sortKey={sortKey} onSort={toggleSort}/>
              <SortTh label="LOC"        k="loc"             sortKey={sortKey} onSort={toggleSort}/>
              <SortTh label="Complexity" k="avg_complexity"  sortKey={sortKey} onSort={toggleSort}/>
              <SortTh label="Commits"    k="commit_count"    sortKey={sortKey} onSort={toggleSort}/>
              <SortTh label="Churn"      k="churn"           sortKey={sortKey} onSort={toggleSort}/>
              <th style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}/>
            </tr>
          </thead>
          <tbody style={{ background: 'var(--card)' }}>
            {filtered.length === 0
              ? <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>No files match your filter.</td></tr>
              : filtered.map((f, i) => <FileRow key={i} file={f}/>)
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
