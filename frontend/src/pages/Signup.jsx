import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GitBranch, Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import { signup } from '../api/client'
import { useAuth } from '../context/AuthContext'

const BENEFITS = [
  'Unlimited repository analyses',
  'Full analysis history saved',
  'ML-powered risk predictions',
  'Actionable recommendations',
]

export default function Signup() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const { saveAuth }          = useAuth()
  const navigate              = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)
    try {
      const data = await signup(name, email, password)
      saveAuth(data.token, data.user)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const strengthColor = password.length >= 8 ? 'var(--green)' : password.length >= 4 ? 'var(--amber)' : 'var(--red)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg)' }}>

      {/* ── Left panel ── */}
      <div style={{ width: 440, flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '48px 44px', position: 'relative', overflow: 'hidden' }}>
        <div className="grid-bg"/>
        <div className="glow-orb" style={{ width: 400, height: 400, background: 'rgba(234,108,10,0.07)', bottom: -100, right: -100 }}/>

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

          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>Free Account Includes</div>
          <h2 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.8px', color: 'var(--text)' }}>
            Everything you need<br/>to ship better code
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginBottom: 44 }}>
            Start analyzing repositories for free. No credit card required.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BENEFITS.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(234,108,10,0.05)', border: '1px solid rgba(234,108,10,0.12)' }}>
                <CheckCircle size={17} style={{ color: 'var(--green)', flexShrink: 0 }}/>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{b}</span>
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

        <div className="fade-up" style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6, letterSpacing: '-0.8px', color: 'var(--text)' }}>Create your account</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>Start analyzing repositories for free</p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px var(--shadow-sm)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <User size={12}/> Full Name
                </label>
                <div className="input-wrap" style={{ padding: '13px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" style={{ fontSize: 15 }}/>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Mail size={12}/> Email Address
                </label>
                <div className="input-wrap" style={{ padding: '13px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ fontSize: 15 }}/>
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <Lock size={12}/> Password
                </label>
                <div className="input-wrap" style={{ padding: '13px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)} required placeholder="Min. 6 characters" style={{ fontSize: 15 }}/>
                  <button type="button" onClick={() => setShow(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 0, flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: password.length >= i * 2 ? strengthColor : 'var(--border)', transition: 'background 0.3s' }}/>
                      ))}
                    </div>
                    <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>
                      {password.length >= 8 ? 'Strong password' : password.length >= 4 ? 'Medium strength' : 'Weak password'}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.06)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.18)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading}
                style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 12, justifyContent: 'center', marginTop: 2 }}>
                {loading ? (
                  <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }}/> Creating account…</>
                ) : (
                  <>Create Account <ArrowRight size={15}/></>
                )}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--muted)', fontWeight: 500 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
