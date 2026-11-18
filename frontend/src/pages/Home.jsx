import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Github, Zap, Shield, BarChart2, ArrowRight, GitBranch } from 'lucide-react'
import { analyzeRepo } from '../api/client'

const FEATURES = [
  { icon: <BarChart2 size={20} />, label: 'Code Metrics',   desc: 'LOC, complexity, churn per file', color: '#2563eb' },
  { icon: <Shield size={20} />,    label: 'Bug Prediction', desc: 'ML model predicts risk level',    color: '#e8622a' },
  { icon: <Zap size={20} />,       label: 'Health Score',   desc: 'Overall repository quality score', color: '#f59e0b' },
]

const STEPS = [
  'Cloning repository...',
  'Parsing source files...',
  'Extracting git history...',
  'Running ML predictions...',
  'Calculating health score...',
]

const EXAMPLES = [
  'https://github.com/pallets/flask',
  'https://github.com/django/django',
  'https://github.com/requests/requests',
]

export default function Home() {
  const [url, setUrl]         = useState('')
  const [token, setToken]     = useState('')
  const [loading, setLoading] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [error, setError]     = useState('')
  const navigate              = useNavigate()

  useEffect(() => {
    if (!loading) { setStepIdx(0); return }
    const id = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 8000)
    return () => clearInterval(id)
  }, [loading])

  async function handleAnalyze() {
    if (!url.trim()) return setError('Please enter a GitHub repository URL.')
    setError('')
    setLoading(true)
    try {
      const data = await analyzeRepo(url.trim(), token.trim())
      navigate('/dashboard', { state: { data } })
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', background: 'var(--dark)' }}>
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(232,98,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 64, borderBottom: '1.5px solid var(--border)', background: 'rgba(255,248,244,0.9)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#e8622a,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(232,98,42,0.3)' }}>
            <GitBranch size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.3px', color: 'var(--text)' }}>
            RepoSense<span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 700, background: 'rgba(37,99,235,0.08)', color: 'var(--accent2)', border: '1px solid rgba(37,99,235,0.15)' }}>v1.0</span>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 700, background: 'rgba(232,98,42,0.08)', color: 'var(--accent)', border: '1px solid rgba(232,98,42,0.15)' }}>ML-Powered</span>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '56px 24px' }}>
        <div className="fade-up" style={{ animationDelay: '0ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ height: 1, width: 32, background: 'var(--accent)' }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)' }}>Intelligent Code Intelligence Platform</span>
            <div style={{ height: 1, width: 32, background: 'var(--accent)' }} />
          </div>
        </div>

        <div className="fade-up" style={{ textAlign: 'center', animationDelay: '80ms' }}>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 8, color: 'var(--text)', letterSpacing: '-2px' }}>Predict Bugs Before</h1>
          <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-2px', background: 'linear-gradient(90deg, var(--accent), #f59e0b, var(--accent2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>They Happen</h1>
          <p style={{ textAlign: 'center', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px', color: 'var(--muted)', lineHeight: 1.75, fontSize: 15 }}>
            Analyze any public GitHub repository. Get ML-powered bug risk predictions, health scores, and actionable insights in seconds.
          </p>
        </div>

        {/* Input card */}
        <div className="fade-up" style={{ width: '100%', maxWidth: 640, animationDelay: '160ms' }}>
          <div style={{ padding: 20, borderRadius: 16, border: '1.5px solid var(--border)', background: 'var(--card)', boxShadow: '0 8px 40px var(--shadow)' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${url ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--dark)', transition: 'border-color 0.2s' }}>
                <Github size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <input
                  type="text" value={url} onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  placeholder="https://github.com/owner/repository"
                  style={{ flex: 1, background: 'transparent', outline: 'none', border: 'none', padding: '12px 0', fontSize: 14, color: 'var(--text)' }}
                />
                {url && <button onClick={() => setUrl('')} style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}
              </div>
              <button onClick={handleAnalyze} disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? 'var(--surface)' : 'var(--accent)', color: loading ? 'var(--muted)' : '#fff', boxShadow: loading ? 'none' : '0 4px 14px rgba(232,98,42,0.3)', transition: 'all 0.2s', minWidth: 120, position: 'relative', overflow: 'hidden' }}
                className={loading ? '' : 'shimmer'}>
                <Search size={15} />{loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>

            <input type="password" value={token} onChange={e => setToken(e.target.value)}
              placeholder="GitHub token (optional — increases API rate limit)"
              style={{ width: '100%', padding: '9px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--dark)', outline: 'none', fontSize: 12, color: 'var(--muted)' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Try:</span>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => setUrl(ex)}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, fontFamily: 'monospace', cursor: 'pointer', background: 'var(--surface)', color: 'var(--accent2)', border: '1px solid var(--border)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e=>e.target.style.opacity='0.7'} onMouseLeave={e=>e.target.style.opacity='1'}>
                  {ex.replace('https://github.com/', '')}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(232,98,42,0.07)', color: 'var(--accent)', border: '1.5px solid rgba(232,98,42,0.2)', fontSize: 13, fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}

            {loading && (
              <div style={{ marginTop: 16 }}>
                {STEPS.map((step, i) => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i < stepIdx ? 'var(--green)' : i === stepIdx ? 'var(--accent)' : 'var(--border)' }}>
                      {i < stepIdx ? <span style={{ fontSize: 9, color: '#fff' }}>✓</span> : i === stepIdx ? <div className="w-2 h-2 rounded-full pulse-bar" style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} /> : null}
                    </div>
                    <span style={{ fontSize: 12, color: i <= stepIdx ? 'var(--text)' : 'var(--muted)', fontWeight: i === stepIdx ? 700 : 400 }}>{step}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, width: '100%', height: 3, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, var(--accent), #f59e0b)', width: `${((stepIdx + 1) / STEPS.length) * 100}%`, transition: 'width 1s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature cards */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 28, maxWidth: 640, width: '100%', animationDelay: '240ms' }}>
          {FEATURES.map(f => (
            <div key={f.label} className="card-hover" style={{ padding: '18px 20px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--card)', boxShadow: '0 2px 12px var(--shadow)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, background: `${f.color}10`, color: f.color }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4, color: 'var(--text)' }}>{f.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '16px', fontSize: 12, color: 'var(--muted)', borderTop: '1.5px solid var(--border)', fontWeight: 500 }}>
        RepoSense AI — ML-powered repository analysis
      </div>
    </div>
  )
}
