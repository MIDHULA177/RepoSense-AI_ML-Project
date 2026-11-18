import { Terminal, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} title="Copy"
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--green)' : 'var(--muted)', display: 'flex', padding: '2px 4px', borderRadius: 4, transition: 'color 0.2s', flexShrink: 0 }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.color = 'var(--muted)' }}>
      {copied ? <Check size={13}/> : <Copy size={13}/>}
    </button>
  )
}

function CommandBlock({ commands, color = 'var(--accent)' }) {
  if (!commands?.length) return <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>None detected.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {commands.map((cmd, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ color, fontSize: 13, flexShrink: 0 }}>$</span>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cmd}</span>
          </div>
          <CopyButton text={cmd}/>
        </div>
      ))}
    </div>
  )
}

function SectionCard({ title, icon, children, badge }) {
  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ display: 'flex', color: 'var(--accent)' }}>{icon}</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{title}</span>
        </div>
        {badge}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  )
}

export default function SetupGuide({ setupGuide }) {
  if (!setupGuide) return <p style={{ fontSize: 13, color: 'var(--muted)' }}>No setup guide available.</p>

  const { prerequisites, install_commands, run_commands, build_commands, test_commands, env_variables, warnings, has_docker, has_tests } = setupGuide

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {warnings.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(217,119,6,0.07)', border: '1px solid rgba(217,119,6,0.22)' }}>
              <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }}/>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Prerequisites + badges */}
      <SectionCard title="Prerequisites" icon={<CheckCircle size={15}/>}
        badge={
          <div style={{ display: 'flex', gap: 6 }}>
            {has_docker && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(37,99,235,0.1)', color: 'var(--blue)', fontWeight: 700 }}>🐳 Docker</span>}
            {has_tests  && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(22,163,74,0.1)', color: 'var(--green)', fontWeight: 700 }}>✓ Tests</span>}
          </div>
        }>
        {prerequisites.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>No prerequisites detected.</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {prerequisites.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 9, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)' }}>
                  <CheckCircle size={12} style={{ color: 'var(--green)' }}/>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{p}</span>
                </div>
              ))}
            </div>
          )
        }
      </SectionCard>

      {/* Commands grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <SectionCard title="Install" icon={<Terminal size={15}/>}>
          <CommandBlock commands={install_commands} color="var(--accent)"/>
        </SectionCard>
        <SectionCard title="Run / Start" icon={<Terminal size={15}/>}>
          <CommandBlock commands={run_commands} color="var(--green)"/>
        </SectionCard>
        <SectionCard title="Build" icon={<Terminal size={15}/>}>
          <CommandBlock commands={build_commands} color="var(--blue)"/>
        </SectionCard>
        <SectionCard title="Test" icon={<Terminal size={15}/>}>
          <CommandBlock commands={test_commands} color="var(--amber)"/>
        </SectionCard>
      </div>

      {/* Env variables */}
      {env_variables.length > 0 && (
        <SectionCard title={`Environment Variables (${env_variables.length})`} icon={<Terminal size={15}/>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {env_variables.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderRadius: 8, background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: 'var(--blue)' }}>{v}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>required</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}
