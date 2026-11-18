import { useState } from 'react'
import { Star, GitFork, Users, GitCommit, AlertCircle, BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

const LANG_COLORS  = ['#2563eb','#ea6c0a','#d97706','#16a34a','#7c3aed','#db2777']
const BREAKDOWN_MAX = { bug_risk: 40, complexity: 20, documentation: 20, activity: 20 }

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{value?.toLocaleString() ?? '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      </div>
    </div>
  )
}

export default function Overview({ repo, health, readmeSummary }) {
  const gradeColor = health.total >= 70 ? 'var(--green)' : health.total >= 50 ? 'var(--amber)' : 'var(--accent)'
  const gaugeData  = [{ value: health.total, fill: gradeColor }]
  const s = readmeSummary

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Repo header */}
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'rgba(37,99,235,0.08)', color: 'var(--blue)', fontFamily: 'monospace', border: '1px solid rgba(37,99,235,0.18)', fontWeight: 700 }}>{repo.owner}</span>
            <span style={{ color: 'var(--muted)' }}>/</span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px', color: 'var(--text)' }}>{repo.name}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.6 }}>{repo.description || 'No description provided'}</p>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
            <span>Created {repo.created_at}</span>
            <span>Last Push {repo.updated_at}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 40, fontWeight: 900, color: gradeColor, letterSpacing: '-1px', lineHeight: 1 }}>{health.total}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>Health Score</div>
        </div>
      </div>

      {/* Project Summary */}
      {s?.available && (
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <BookOpen size={14} style={{ color: 'var(--cyan)' }}/>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Project Summary</span>
          </div>

          {/* Full summary paragraph */}
          {s.project_summary && (
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, margin: 0, padding: '14px 16px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--cyan)' }}>
              {s.project_summary}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Key features */}
            {s.features?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 8 }}>Key Features</div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {s.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>▸</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Categories */}
              {s.categories?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 7 }}>Project Type</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {s.categories.map(c => (
                      <span key={c} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(121,192,255,0.08)', color: 'var(--cyan)', border: '1px solid rgba(121,192,255,0.2)', fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected tech */}
              {s.detected_tech?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)', marginBottom: 7 }}>Technologies</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {s.detected_tech.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(227,179,65,0.08)', color: 'var(--orange)', border: '1px solid rgba(227,179,65,0.2)', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ML risk stats */}
          {s.ml_analysis && (
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', padding: '12px 16px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              {[
                { label: 'Total Files',    value: s.ml_analysis.total_files },
                { label: 'High Risk',      value: s.ml_analysis.high_risk,    color: 'var(--accent)' },
                { label: 'Medium Risk',    value: s.ml_analysis.medium_risk,  color: 'var(--orange)' },
                { label: 'Avg Complexity', value: s.ml_analysis.avg_complexity },
                { label: 'Overall Risk',   value: s.ml_analysis.overall_risk,
                  color: s.ml_analysis.overall_risk === 'High' ? 'var(--accent)' : s.ml_analysis.overall_risk === 'Medium' ? 'var(--orange)' : 'var(--green)' },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{m.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: m.color || 'var(--text)', marginTop: 3 }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        <StatCard icon={<Star size={16}/>}        label="Stars"        value={repo.stars}        color="#d97706"/>
        <StatCard icon={<GitFork size={16}/>}     label="Forks"        value={repo.forks}        color="#2563eb"/>
        <StatCard icon={<Users size={16}/>}       label="Contributors" value={repo.contributors}  color="#ea6c0a"/>
        <StatCard icon={<GitCommit size={16}/>}   label="Commits"      value={repo.total_commits} color="#16a34a"/>
        <StatCard icon={<AlertCircle size={16}/>} label="Open Issues"  value={repo.open_issues}   color="#d97706"/>
      </div>

      {/* Health gauge + breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 16 }}>Health Score</div>
          <ResponsiveContainer width="100%" height={150}>
            <RadialBarChart cx="50%" cy="100%" innerRadius="65%" outerRadius="95%" data={gaugeData} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--border)' }}/>
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 52, fontWeight: 900, color: gradeColor, marginTop: -12, letterSpacing: '-2px', lineHeight: 1 }}>{health.total}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: gradeColor, marginTop: 6 }}>{health.grade}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 18 }}>
            {health.badges.map(b => (
              <span key={b.label} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: b.ok ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)', color: b.ok ? 'var(--green)' : 'var(--amber)', border: `1px solid ${b.ok ? 'rgba(22,163,74,0.2)' : 'rgba(217,119,6,0.2)'}`, fontWeight: 600 }}>
                {b.ok ? '✓' : '⚠'} {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 20 }}>Score Breakdown</div>
          {Object.entries(health.breakdown).map(([key, val]) => {
            const max   = BREAKDOWN_MAX[key] ?? 30
            const pct   = Math.min((val / max) * 100, 100)
            const color = pct >= 66 ? 'var(--green)' : pct >= 33 ? 'var(--amber)' : 'var(--accent)'
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            return (
              <div key={key} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 7 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>{val} / {max}</span>
                </div>
                <div style={{ height: 5, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
                  <div className="grow-w" style={{ height: '100%', borderRadius: 999, background: color, width: `${pct}%` }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      {Object.keys(repo.languages || {}).length > 0 && (
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 14 }}>Languages</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(repo.languages).map(([lang, bytes], i) => {
              const c = LANG_COLORS[i % LANG_COLORS.length]
              return (
                <span key={lang} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 12px', borderRadius: 6, background: `${c}10`, color: c, border: `1px solid ${c}30`, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }}/>
                  {lang} · {(bytes / 1024).toFixed(0)} KB
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
