import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GitBranch, Search, Github, LogOut, Clock, Trash2, BarChart2, Shield, Zap, Plus, Compass } from 'lucide-react'
import { analyzeRepo, getHistory, deleteAnalysis, getAnalysis } from '../api/client'
import { useAuth } from '../context/AuthContext'
import RepoDiscovery from '../components/RepoDiscovery'

const STEPS    = ['Cloning repository…','Parsing source files…','Extracting git history…','Running ML predictions…','Calculating health score…','Building tech stack…']
const EXAMPLES = ['pallets/flask','django/django','requests/requests']

function HealthDot({ score }) {
  const color = score >= 70 ? 'var(--green)' : score >= 50 ? 'var(--amber)' : 'var(--accent)'
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }}/>
}

function SidebarItem({ item, onClick, onDelete }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ margin: '1px 8px', padding: '10px', borderRadius: 6, cursor: 'pointer', background: hovered ? 'var(--border)' : 'transparent', transition: 'background 0.12s' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <HealthDot score={item.health_score}/>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.repo_owner}/{item.repo_name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
            <span style={{ color: 'var(--accent-d)' }}>{item.high_risk} high</span>
            <span style={{ color: 'var(--amber)' }}>{item.medium_risk} med</span>
            <span style={{ color: 'var(--green)' }}>{item.low_risk} low</span>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
          <Trash2 size={11}/>
        </button>
      </div>
    </div>
  )
}

export default function AppPage() {
  const [url, setUrl]             = useState('')
  const [token, setToken]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [stepIdx, setStepIdx]     = useState(0)
  const [error, setError]         = useState('')
  const [history, setHistory]     = useState([])
  const [showToken, setShowToken] = useState(false)
  const [tab, setTab]             = useState('analyze') // 'analyze' | 'discover'
  const { user, logout }          = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => { getHistory().then(setHistory).catch(() => {}) }, [])

  useEffect(() => {
    if (!loading) { setStepIdx(0); return }
    const id = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 7000)
    return () => clearInterval(id)
  }, [loading])

  async function handleAnalyze(repoUrl) {
    const target = repoUrl || url.trim()
    if (!target) return setError('Please enter a GitHub repository URL.')
    setError('')
    setLoading(true)
    setTab('analyze')
    if (repoUrl) setUrl(repoUrl)
    try {
      const data = await analyzeRepo(target, token.trim())
      const entry = {
        id: Date.now(),
        repo_name: data.repo.name, repo_owner: data.repo.owner,
        health_score: data.health.total, health_grade: data.health.grade,
        total_files: data.total_files,
        high_risk: data.high_risk_count, medium_risk: data.medium_risk_count, low_risk: data.low_risk_count,
        created_at: new Date().toISOString(), _data: data,
      }
      setHistory(h => [entry, ...h])
      navigate('/dashboard', { state: { data } })
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Check the URL and try again.')
    } finally { setLoading(false) }
  }

  async function handleHistoryClick(item) {
    if (item._data) return navigate('/dashboard', { state: { data: item._data } })
    try { const data = await getAnalysis(item.id); navigate('/dashboard', { state: { data } }) } catch {}
  }

  async function handleDelete(id) {
    try { await deleteAnalysis(id) } catch {}
    setHistory(h => h.filter(a => a.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--bg2)', height: '100vh', position: 'sticky', top: 0 }}>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#ea6c0a,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px var(--glow-sm)' }}>
            <GitBranch size={13} color="#fff"/>
          </div>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text)' }}>RepoSense<span style={{ color: 'var(--accent)' }}>AI</span></span>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--amber))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#fff', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={11} style={{ color: 'var(--muted)' }}/>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>History</span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{history.length}</span>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <BarChart2 size={18} style={{ color: 'var(--muted)' }}/>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>No analyses yet.<br/>Analyze your first repo!</div>
            </div>
          ) : history.map(item => (
            <SidebarItem key={item.id} item={item} onClick={() => handleHistoryClick(item)} onDelete={() => handleDelete(item.id)}/>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { logout(); navigate('/') }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontSize: 12, fontWeight: 600, border: '1px solid var(--border2)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)' }}>
            <LogOut size={12}/> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top nav tabs */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '0 32px', height: 52, borderBottom: '1px solid var(--border)', background: 'rgba(255,247,237,0.96)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          {[
            { id: 'analyze',  label: 'Analyze',  icon: <Search size={13}/> },
            { id: 'discover', label: 'Discover', icon: <Compass size={13}/> },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px', height: '100%', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`, color: tab === t.id ? 'var(--accent)' : 'var(--muted)', fontSize: 13, fontWeight: tab === t.id ? 800 : 600, cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1 }}>
              {t.icon}{t.label}
            </button>
          ))}
        </header>

        {/* Analyze tab */}
        {tab === 'analyze' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', overflow: 'hidden', background: 'var(--surface)' }}>
            <div className="grid-bg"/>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(234,108,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }}/>

            <div className="fade-up" style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(234,108,10,0.08)', border: '1px solid rgba(234,108,10,0.2)', marginBottom: 16 }}>
                  <Zap size={12} style={{ color: 'var(--accent)' }}/>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>ML-Powered Analysis</span>
                </div>
                <h1 style={{ fontSize: 34, fontWeight: 900, marginBottom: 10, letterSpacing: '-0.5px', color: 'var(--text)' }}>Analyze Any Repository</h1>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.7 }}>Paste a public GitHub URL to get bug predictions, health score, tech stack, and setup guide.</p>
              </div>

              <div className="card" style={{ overflow: 'hidden', boxShadow: '0 8px 32px var(--shadow)' }}>

                <div style={{ padding: '20px 20px 14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, border: `1px solid ${url ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--bg)', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: url ? '0 0 0 3px rgba(234,108,10,0.1)' : 'none' }}>
                      <Github size={15} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
                      <input type="text" value={url} onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                        placeholder="https://github.com/owner/repository"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit' }}/>
                      {url && <button onClick={() => setUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, lineHeight: 1, padding: 0 }}>✕</button>}
                    </div>
                    <button onClick={() => handleAnalyze()} disabled={loading} className="btn-primary"
                      style={{ borderRadius: 10, padding: '12px 24px', fontSize: 14 }}>
                      <Search size={14}/>
                      {loading ? 'Analyzing…' : 'Analyze'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Try:</span>
                    {EXAMPLES.map(ex => (
                      <button key={ex} onClick={() => setUrl(`https://github.com/${ex}`)}
                        style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: 'var(--bg2)', color: 'var(--blue)', border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'monospace', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', padding: '10px 20px' }}>
                  <button onClick={() => setShowToken(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                    <Plus size={12}/> {showToken ? 'Hide' : 'Add'} GitHub token (optional)
                  </button>
                  {showToken && (
                    <input type="password" value={token} onChange={e => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxx — increases API rate limit"
                      style={{ width: '100%', marginTop: 8, padding: '9px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text2)', fontSize: 12, outline: 'none', fontFamily: 'monospace' }}/>
                  )}
                </div>

                {error && (
                  <div style={{ margin: '0 20px 14px', padding: '10px 14px', borderRadius: 8, background: 'rgba(220,38,38,0.06)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.18)', fontSize: 13, fontWeight: 600 }}>
                    ⚠ {error}
                  </div>
                )}

                {loading && (
                  <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border)' }}>
                    {STEPS.map((step, i) => {
                      const done   = i < stepIdx
                      const active = i === stepIdx
                      const dotBg  = done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border2)'
                      return (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: dotBg, transition: 'background 0.3s' }}>
                            {done   && <span style={{ fontSize: 9, color: '#fff', fontWeight: 900 }}>✓</span>}
                            {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'block' }} className="blink"/>}
                          </div>
                          <span style={{ fontSize: 12, color: i <= stepIdx ? 'var(--text)' : 'var(--muted2)', transition: 'color 0.3s', fontWeight: active ? 600 : 400 }}>{step}</span>
                        </div>
                      )
                    })}
                    <div style={{ height: 3, borderRadius: 999, background: 'var(--border)', overflow: 'hidden', marginTop: 6 }}>
                      <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,var(--accent),var(--amber))', width: `${((stepIdx + 1) / STEPS.length) * 100}%`, transition: 'width 1s ease' }}/>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: <BarChart2 size={13}/>, label: 'Code Metrics',    color: 'var(--blue)'   },
                  { icon: <Shield size={13}/>,    label: 'Bug Prediction',  color: 'var(--accent)' },
                  { icon: <Zap size={13}/>,       label: 'Tech Stack',      color: 'var(--amber)'  },
                  { icon: <Search size={13}/>,    label: 'Setup Guide',     color: 'var(--green)'  },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: '1px solid var(--border)', background: 'var(--card)' }}>
                    <span style={{ color: f.color, display: 'flex' }}>{f.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discover tab */}
        {tab === 'discover' && (
          <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', background: 'var(--surface)' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 6 }}>Discover Repositories</h2>
              <p style={{ fontSize: 14, color: 'var(--muted)' }}>Search GitHub or browse trending repos — click Analyze to run a full analysis.</p>
            </div>
            <RepoDiscovery onAnalyze={url => handleAnalyze(url)}/>
          </div>
        )}
      </div>
    </div>
  )
}
