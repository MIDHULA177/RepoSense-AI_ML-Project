import { useNavigate } from 'react-router-dom'
import { GitBranch, BarChart2, Shield, Zap, ArrowRight, Github, Users, Star, Code2, ChevronRight, Activity, TrendingUp, Lock, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { icon: <Github size={20}/>,    title: 'Repository Cloning',   desc: 'Paste any public GitHub URL. We clone and analyze the full codebase automatically in seconds.', color: '#f97316' },
  { icon: <Code2 size={20}/>,     title: 'Code Metrics',         desc: 'Extract LOC, cyclomatic complexity, comment ratio, and function count per file.',                color: '#f59e0b' },
  { icon: <Activity size={20}/>,  title: 'Git History Analysis', desc: 'Mine commit history for churn, contributor count, and bug-fix commits per file.',                 color: '#fb923c' },
  { icon: <Shield size={20}/>,    title: 'ML Bug Prediction',    desc: 'Random Forest model trained on NASA PROMISE data predicts High / Medium / Low risk.',             color: '#22c55e' },
  { icon: <Zap size={20}/>,       title: 'Health Score',         desc: 'Composite 0–100 score across bug risk, activity, documentation and complexity.',                  color: '#3b82f6' },
  { icon: <TrendingUp size={20}/>, title: 'Analysis History',    desc: 'Every analysis is saved to your account. Revisit, compare, and track improvements over time.',    color: '#a855f7' },
]

const STEPS = [
  { num: '01', title: 'Create Account', desc: 'Sign up free in under 30 seconds. No credit card required.' },
  { num: '02', title: 'Paste GitHub URL', desc: 'Enter any public repository URL and optionally add a GitHub token.' },
  { num: '03', title: 'Click Analyze', desc: 'We clone the repo, parse all files, and run ML predictions.' },
  { num: '04', title: 'View Insights', desc: 'Explore charts, risk table, health score, and recommendations.' },
]

const STATS = [
  { value: '10+',  label: 'Code Metrics',   sub: 'per file'       },
  { value: 'RF',   label: 'Random Forest',  sub: 'ML model'       },
  { value: '3',    label: 'Risk Levels',    sub: 'High/Med/Low'   },
  { value: '100',  label: 'Health Scale',   sub: 'composite score' },
]

const TESTIMONIALS = [
  { name: 'Arjun Mehta',    role: 'Backend Engineer',      avatar: 'AM', text: 'Found 3 high-risk files in our codebase that we had been ignoring for months. The ML predictions are surprisingly accurate.' },
  { name: 'Priya Sharma',   role: 'Tech Lead',              avatar: 'PS', text: 'The health score gives a quick snapshot before code reviews. Saves the team a lot of time every sprint.' },
  { name: 'Daniel Okonkwo', role: 'Open Source Maintainer', avatar: 'DO', text: 'I run this on every PR to check if new files are introducing complexity spikes. It\'s become part of my workflow.' },
]

const TRUST = [
  { icon: <Lock size={14}/>,         label: 'No code stored' },
  { icon: <CheckCircle size={14}/>,  label: 'Public repos only' },
  { icon: <Shield size={14}/>,       label: 'Secure analysis' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)', background: 'rgba(255,247,237,0.92)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#f97316,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(249,115,22,0.4)' }}>
              <GitBranch size={16} color="#fff"/>
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.4px' }}>
              RepoSense<span style={{ color: 'var(--accent)' }}>AI</span>
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {[['#features','Features'],['#how','How it Works'],['#reviews','Reviews']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}>{label}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {user ? (
              <button className="btn-primary" onClick={() => navigate('/app')}>
                Go to App <ArrowRight size={14}/>
              </button>
            ) : (<>
              <button className="btn-ghost" onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn-primary" onClick={() => navigate('/signup')}>
                Get Started <ArrowRight size={14}/>
              </button>
            </>)}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '130px 0 110px', textAlign: 'center' }}>
        <div className="grid-bg"/>
        {/* Glow orbs */}
        <div className="glow-orb" style={{ width: 600, height: 400, background: 'rgba(234,108,10,0.1)', top: -100, left: '50%', transform: 'translateX(-50%)' }}/>
        <div className="glow-orb" style={{ width: 300, height: 300, background: 'rgba(217,119,6,0.07)', top: 200, left: '20%' }}/>
        <div className="glow-orb" style={{ width: 250, height: 250, background: 'rgba(234,108,10,0.06)', top: 100, right: '15%' }}/>

        <div style={{ position: 'relative', maxWidth: 1140, margin: '0 auto', padding: '0 32px' }}>
          {/* Pill badge */}
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 999, background: 'rgba(234,108,10,0.08)', color: 'var(--accent)', border: '1px solid rgba(234,108,10,0.22)', fontSize: 12, fontWeight: 700, marginBottom: 40, letterSpacing: 0.3 }}>
            <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} className="pulse-ring"/>
            &nbsp;&nbsp;ML-Powered Repository Intelligence
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{ fontSize: 'clamp(44px,6.5vw,76px)', fontWeight: 900, lineHeight: 1.04, marginBottom: 28, letterSpacing: '-2.5px', animationDelay: '0.05s' }}>
            Predict Bugs Before<br/>
            <span className="grad-text">They Hit Production</span>
          </h1>

          {/* Sub */}
          <p className="fade-up" style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto 48px', animationDelay: '0.1s' }}>
            Analyze any public GitHub repository. Get ML-powered bug risk predictions, code health scores, and actionable insights — in under a minute.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', animationDelay: '0.15s' }}>
            <button className="btn-primary" onClick={() => navigate(user ? '/app' : '/signup')} style={{ padding: '14px 36px', fontSize: 15, borderRadius: 12 }}>
              Start Analyzing Free <ArrowRight size={16}/>
            </button>
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ padding: '14px 36px', fontSize: 15, borderRadius: 12 }}>
              Sign in
            </button>
          </div>

          {/* Trust badges */}
          <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 28, animationDelay: '0.2s' }}>
            {TRUST.map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted2)', fontWeight: 600 }}>
                <span style={{ color: 'var(--accent)', display: 'flex' }}>{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>

          {/* Stats strip */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', marginTop: 80, maxWidth: 620, margin: '80px auto 0', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border2)', boxShadow: '0 4px 24px var(--shadow)', animationDelay: '0.25s' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '24px 16px', textAlign: 'center', background: 'var(--card)', borderRight: i < 3 ? '1px solid var(--border)' : 'none', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(234,108,10,0.04) 0%, transparent 100%)', pointerEvents: 'none' }}/>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 2, fontWeight: 500 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '96px 0', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb" style={{ width: 500, height: 300, background: 'rgba(234,108,10,0.06)', bottom: 0, right: 0 }}/>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>Features</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>Everything You Need</h2>
            <p style={{ color: 'var(--muted)', maxWidth: 460, lineHeight: 1.75, fontSize: 15 }}>From raw repository URL to actionable bug predictions — all in one place, no setup required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card card-hover" style={{ padding: '28px 28px 32px', animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}14`, border: `1px solid ${f.color}25`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: 'var(--text)' }}>{f.title}</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="grid-bg" style={{ opacity: 0.5 }}/>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>Process</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, marginBottom: 14, letterSpacing: '-1px' }}>How It Works</h2>
            <p style={{ color: 'var(--muted)', lineHeight: 1.75, fontSize: 15 }}>Four simple steps from URL to deep insights.</p>
          </div>

          {/* Connector line */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1, background: 'linear-gradient(90deg, transparent, var(--border2), var(--accent-d), var(--border2), transparent)', zIndex: 0 }}/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, position: 'relative', zIndex: 1 }}>
              {STEPS.map((s, i) => (
                <div key={s.num} className="card card-hover" style={{ padding: '28px 24px 32px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(234,108,10,0.12),rgba(217,119,6,0.08))', border: '1px solid rgba(234,108,10,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 2px 12px var(--glow-sm)' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>{s.num}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 10, color: 'var(--text)' }}>{s.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="reviews" style={{ padding: '96px 0', background: 'var(--bg2)', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb" style={{ width: 400, height: 300, background: 'rgba(234,108,10,0.07)', top: 0, left: '30%' }}/>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14 }}>Reviews</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, letterSpacing: '-1px' }}>What Developers Say</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card card-hover" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--amber)" style={{ color: 'var(--amber)' }}/>)}
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.85, flex: 1 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--amber))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 10px var(--glow-sm)' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="glow-orb" style={{ width: 700, height: 400, background: 'rgba(234,108,10,0.07)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}/>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 32px', textAlign: 'center', position: 'relative' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '72px 56px', borderRadius: 20, border: '1px solid var(--border2)', background: 'linear-gradient(135deg, rgba(234,108,10,0.05) 0%, rgba(217,119,6,0.03) 50%, rgba(234,108,10,0.05) 100%)', boxShadow: '0 8px 40px var(--shadow), inset 0 1px 0 rgba(234,108,10,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 20 }}>Get Started</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 900, marginBottom: 16, letterSpacing: '-1px' }}>Ready to Analyze?</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 40, lineHeight: 1.75, fontSize: 15 }}>Sign up free and start predicting bugs in your repositories today. No credit card required.</p>
            <button className="btn-primary" onClick={() => navigate(user ? '/app' : '/signup')} style={{ padding: '14px 44px', fontSize: 15, borderRadius: 12 }}>
              Get Started Free <ArrowRight size={16}/>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 24 }}>
              {TRUST.map(t => (
                <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--muted2)', fontWeight: 600 }}>
                  <span style={{ color: 'var(--accent)', display: 'flex' }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#ea6c0a,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch size={12} color="#fff"/>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800 }}>RepoSense<span style={{ color: 'var(--accent)' }}>AI</span></span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500 }}>ML-Powered Repository Analysis · © 2026 RepoSenseAI · All rights reserved</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy','Terms','Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'var(--muted2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted2)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
