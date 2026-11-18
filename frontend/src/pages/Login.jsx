import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GitBranch, Mail, Lock, Eye, EyeOff, Shield, Zap, BarChart2, ArrowRight } from 'lucide-react'
import { login } from '../api/client'
import { useAuth } from '../context/AuthContext'

const PERKS = [
  { icon: <BarChart2 size={18}/>, title: 'ML Bug Prediction',  desc: 'Random Forest model predicts defect risk per file.' },
  { icon: <Shield size={18}/>,    title: 'Health Scoring',      desc: 'Composite 0–100 score across 4 dimensions.'        },
  { icon: <Zap size={18}/>,       title: 'Instant Analysis',    desc: 'Full repo analyzed in under 60 seconds.'           },
]

export default function Login() {
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { saveAuth }          = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      saveAuth(data.token, data.user)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left panel ── */}
      <div style={{ width: 440, flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '48px 44px', position: 'relative', overflow: 'hidden' }}>
        <div className="grid-bg"/>
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(234,108,10,0.07)', bottom: -100, left: -100 }}/>

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#ea6c0a,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px var(--glow-sm)' }}>
              <GitBranch size={15} color="#fff"/>
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--text)' }}>
              RepoSense<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </div>

          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>Why RepoSenseAI</div>
          <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.8px', color: 'var(--text)' }}>
            Predict defects before<br/>they reach production
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 44 }}>
            Analyze any GitHub repository with ML-powered insights in under a minute.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PERKS.map(p => (
              <div key={p.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 12, background: 'rgba(234,108,10,0.05)', border: '1px solid rgba(234,108,10,0.12)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(234,108,10,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500, marginTop: 'auto', paddingTop: 32, position: 'relative' }}>© 2026 RepoSenseAI · All rights reserved</p>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', position: 'relative', background: 'var(--surface)' }}>
        <div className="grid-bg"/>
        <div className="glow-orb" style={{ width: 500, height: 400, background: 'rgba(234,108,10,0.05)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}/>

        <div className="fade-up" style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.8px', color: 'var(--text)' }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Email address</label>
              <div className="input-wrap">
                <Mail size={15} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"/>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8 }}>Password</label>
              <div className="input-wrap">
                <Lock size={15} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)} required placeholder="••••••••"/>
                <button type="button" onClick={() => setShow(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0, flexShrink: 0, transition: 'color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                  {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.06)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.18)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '13px', fontSize: 15, borderRadius: 10, justifyContent: 'center' }}>
              {loading ? (
                <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }}/> Signing in…</>
              ) : (
                <>Sign In <ArrowRight size={15}/></>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
            <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 600, whiteSpace: 'nowrap' }}>New to RepoSenseAI?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
          </div>

          <Link to="/signup"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 10, background: 'transparent', color: 'var(--muted)', fontWeight: 700, fontSize: 14, border: '1px solid var(--border2)', textDecoration: 'none', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(234,108,10,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}>
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  )
}
