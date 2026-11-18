import { Code2, Database, Wrench, Package, FileCode, Layers } from 'lucide-react'

const LANG_COLORS = ['#2563eb','#ea6c0a','#d97706','#16a34a','#7c3aed','#db2777','#0891b2','#65a30d']

const FRAMEWORK_ICONS = {
  React: '⚛️', Vue: '💚', Angular: '🔴', 'Next.js': '▲', Svelte: '🔥',
  Express: '🚂', FastAPI: '⚡', Django: '🎸', Flask: '🌶️', Spring: '🍃',
  Laravel: '🔴', Rails: '💎', Gin: '🍸', NestJS: '🐱', Nuxt: '💚',
  Remix: '💿', Astro: '🚀', Vite: '⚡', Tailwind: '🎨', Prisma: '🔷',
  SQLAlchemy: '🗄️', Celery: '🌿', Pandas: '🐼', PyTorch: '🔥', TensorFlow: '🧠',
  'Scikit-learn': '🤖',
}

const DB_COLORS = {
  PostgreSQL: '#336791', MySQL: '#4479a1', MongoDB: '#47a248',
  SQLite: '#003b57', Redis: '#dc382d', Supabase: '#3ecf8e',
  Firebase: '#ffca28', Elasticsearch: '#005571',
}

function Section({ icon, title, children, count }) {
  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'flex', color: 'var(--accent)' }}>{icon}</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>{title}</span>
        </div>
        {count !== undefined && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(234,108,10,0.1)', color: 'var(--accent)', fontWeight: 700 }}>{count}</span>
        )}
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  )
}

function EmptyState({ msg }) {
  return <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{msg}</p>
}

export default function TechStack({ techStack }) {
  if (!techStack) return <EmptyState msg="No tech stack data available." />

  const { languages, frameworks, databases, tools, dependency_files, raw_dependencies } = techStack

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)
  const sortedLangs = Object.entries(languages).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Languages bar */}
      <Section icon={<Code2 size={15}/>} title="Languages Detected" count={sortedLangs.length}>
        {sortedLangs.length === 0 ? <EmptyState msg="No languages detected." /> : (
          <>
            {/* Stacked bar */}
            <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 18, gap: 2 }}>
              {sortedLangs.map(([lang, count], i) => (
                <div key={lang} title={`${lang}: ${count} files`}
                  style={{ flex: count, background: LANG_COLORS[i % LANG_COLORS.length], minWidth: 4, transition: 'flex 0.5s ease' }}/>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {sortedLangs.map(([lang, count], i) => {
                const color = LANG_COLORS[i % LANG_COLORS.length]
                const pct = totalBytes > 0 ? ((count / totalBytes) * 100).toFixed(1) : 0
                return (
                  <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1px solid ${color}30`, background: `${color}0d` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{lang}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{count} files · {pct}%</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Section>

      {/* Frameworks + Databases side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        <Section icon={<Layers size={15}/>} title="Frameworks & Libraries" count={frameworks.length}>
          {frameworks.length === 0 ? <EmptyState msg="No frameworks detected." /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {frameworks.map(fw => (
                <div key={fw} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: 'rgba(234,108,10,0.06)', border: '1px solid rgba(234,108,10,0.18)' }}>
                  <span style={{ fontSize: 14 }}>{FRAMEWORK_ICONS[fw] || '📦'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{fw}</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section icon={<Database size={15}/>} title="Databases" count={databases.length}>
          {databases.length === 0 ? <EmptyState msg="No databases detected." /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {databases.map(db => {
                const color = DB_COLORS[db] || '#6b7280'
                return (
                  <div key={db} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 10, background: `${color}12`, border: `1px solid ${color}35` }}>
                    <Database size={12} style={{ color }}/>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{db}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Tools + Dep files side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>

        <Section icon={<Wrench size={15}/>} title="Dev Tools & CI" count={tools.length}>
          {tools.length === 0 ? <EmptyState msg="No tools detected." /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tools.map(tool => (
                <span key={tool} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.07)', color: 'var(--blue)', border: '1px solid rgba(37,99,235,0.18)', fontWeight: 700 }}>
                  {tool}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section icon={<FileCode size={15}/>} title="Dependency Files" count={dependency_files.length}>
          {dependency_files.length === 0 ? <EmptyState msg="No dependency files found." /> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dependency_files.map(f => (
                <span key={f} style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(22,163,74,0.07)', color: 'var(--green)', border: '1px solid rgba(22,163,74,0.2)', fontWeight: 700, fontFamily: 'monospace' }}>
                  {f}
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Dependencies list */}
      {raw_dependencies.length > 0 && (
        <Section icon={<Package size={15}/>} title="Key Dependencies" count={raw_dependencies.length}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {raw_dependencies.slice(0, 60).map((dep, i) => (
              <span key={i} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border)', fontFamily: 'monospace', fontWeight: 600 }}>
                {dep}
              </span>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
