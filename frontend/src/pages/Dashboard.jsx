import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Github, ArrowLeft, Download, LayoutDashboard, BarChart2, AlertTriangle, GitBranch, Lightbulb, Layers, Terminal, GitMerge } from 'lucide-react'
import Overview        from '../components/Overview'
import Charts          from '../components/Charts'
import RiskTable       from '../components/RiskTable'
import Recommendations from '../components/Recommendations'
import TechStack       from '../components/TechStack'
import SetupGuide      from '../components/SetupGuide'
import ImpactAnalysis  from '../components/ImpactAnalysis'

const TABS = [
  { id: 'Overview',        label: 'Overview',        icon: <LayoutDashboard size={14}/> },
  { id: 'Charts',          label: 'Charts',          icon: <BarChart2 size={14}/> },
  { id: 'Predictions',     label: 'Risk Table',      icon: <AlertTriangle size={14}/> },
  { id: 'Recommendations', label: 'Recommendations', icon: <Lightbulb size={14}/> },
  { id: 'TechStack',       label: 'Tech Stack',      icon: <Layers size={14}/> },
  { id: 'SetupGuide',      label: 'Setup Guide',     icon: <Terminal size={14}/> },
  { id: 'Impact',          label: 'Impact',          icon: <GitMerge size={14}/> },
]

export default function Dashboard() {
  const { state }     = useLocation()
  const navigate      = useNavigate()
  const [tab, setTab] = useState('Overview')

  if (!state?.data) { navigate('/app'); return null }

  const { repo, health, predictions, high_risk_count, medium_risk_count, low_risk_count,
          recommendations, tech_stack, setup_guide, impact_analysis, dependency_edges, readme_summary } = state.data

  const gradeColor = health.total >= 70 ? 'var(--green)' : health.total >= 50 ? 'var(--amber)' : 'var(--accent)'

  function downloadCSV() {
    const headers = ['file_path','risk_level','bug_probability','loc','avg_complexity','commit_count','churn']
    const rows    = predictions.map(p => headers.map(h => p[h]).join(','))
    const blob    = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a       = document.createElement('a')
    a.href        = URL.createObjectURL(blob)
    a.download    = `${repo.name}_analysis.csv`
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--bg2)', height: '100vh', position: 'sticky', top: 0 }}>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#ea6c0a,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px var(--glow-sm)' }}>
            <GitBranch size={13} color="#fff"/>
          </div>
          <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--text)' }}>RepoSense<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>

        {/* Repo info */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Github size={11} style={{ color: 'var(--muted)' }}/>
            <span style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{repo.owner}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10 }}>{repo.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: 'rgba(234,108,10,0.08)', border: '1px solid rgba(234,108,10,0.2)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: gradeColor, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, fontWeight: 800, color: gradeColor }}>{health.total}/100 · {health.grade}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: tab === t.id ? 700 : 600, cursor: 'pointer', border: 'none', textAlign: 'left', marginBottom: 2, background: tab === t.id ? 'rgba(234,108,10,0.1)' : 'transparent', color: tab === t.id ? 'var(--accent)' : 'var(--muted)', borderLeft: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = 'rgba(234,108,10,0.06)' }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'transparent' }}>
              <span style={{ display: 'flex' }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Risk summary */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 10 }}>Risk Summary</div>
          {[
            { label: 'High',   count: high_risk_count,   color: 'var(--accent-d)' },
            { label: 'Medium', count: medium_risk_count, color: 'var(--amber)'    },
            { label: 'Low',    count: low_risk_count,    color: 'var(--green)'    },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: r.color, flexShrink: 0 }}/>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{r.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 900, color: r.color }}>{r.count}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={downloadCSV}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', borderRadius: 8, background: 'rgba(37,99,235,0.07)', color: 'var(--blue)', fontSize: 12, fontWeight: 700, border: '1px solid rgba(37,99,235,0.18)', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.13)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.07)'}>
            <Download size={12}/> Export CSV
          </button>
          <button onClick={() => navigate('/app')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', borderRadius: 8, background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, border: '1px solid var(--border2)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)' }}>
            <ArrowLeft size={12}/> New Analysis
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 52, borderBottom: '1px solid var(--border)', background: 'rgba(255,247,237,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', color: 'var(--accent)' }}>{TABS.find(t => t.id === tab)?.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{TABS.find(t => t.id === tab)?.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{repo.owner}/{repo.name}</span>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(234,108,10,0.1)', color: gradeColor, fontWeight: 700, border: '1px solid rgba(234,108,10,0.2)' }}>
              {health.grade}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="fade-up" style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: 'var(--surface)' }}>
          {tab === 'Overview'        && <Overview repo={repo} health={health} readmeSummary={readme_summary}/>}
          {tab === 'Charts'          && <Charts repo={repo} predictions={predictions}/>}
          {tab === 'Predictions'     && <RiskTable predictions={predictions} counts={{ high: high_risk_count, medium: medium_risk_count, low: low_risk_count }}/>}
          {tab === 'Recommendations' && <Recommendations predictions={predictions} recommendations={recommendations || []}/>}
          {tab === 'TechStack'       && <TechStack techStack={tech_stack}/>}
          {tab === 'SetupGuide'      && <SetupGuide setupGuide={setup_guide}/>}
          {tab === 'Impact'          && <ImpactAnalysis impactAnalysis={impact_analysis} dependencyEdges={dependency_edges} predictions={predictions}/>}
        </main>
      </div>
    </div>
  )
}
