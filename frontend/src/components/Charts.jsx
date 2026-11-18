import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const LANG_COLORS = ['#1d4ed8','#e8622a','#d97706','#059669','#7c3aed','#db2777']
const RISK_COLORS = { High: '#d95a1e', Medium: '#d97706', Low: '#059669' }
const TT = { background: 'var(--card)', border: '1px solid var(--border2)', color: 'var(--text)', fontSize: 12, borderRadius: 8, boxShadow: '0 4px 16px var(--shadow)' }

function Card({ title, desc, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
        {desc && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{desc}</div>}
      </div>
      {children}
    </div>
  )
}

function PieLabel({ cx, cy, midAngle, outerRadius, percent, name }) {
  if (percent < 0.06) return null
  const RAD = Math.PI / 180
  const x   = cx + (outerRadius + 18) * Math.cos(-midAngle * RAD)
  const y   = cy + (outerRadius + 18) * Math.sin(-midAngle * RAD)
  return (
    <text x={x} y={y} fill="var(--muted)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
      {name} {(percent * 100).toFixed(0)}%
    </text>
  )
}

export default function Charts({ repo, predictions }) {
  const langData = Object.entries(repo.languages || {}).map(([name, bytes]) => ({ name, bytes }))

  const riskCounts = predictions.reduce((acc, p) => { acc[p.risk_level] = (acc[p.risk_level] || 0) + 1; return acc }, {})
  const riskData   = Object.entries(riskCounts).map(([name, value]) => ({ name, value }))

  const buckets = { '0–50': 0, '51–200': 0, '201–500': 0, '500+': 0 }
  predictions.forEach(p => {
    if (p.loc <= 50)       buckets['0–50']++
    else if (p.loc <= 200) buckets['51–200']++
    else if (p.loc <= 500) buckets['201–500']++
    else                   buckets['500+']++
  })
  const locData = Object.entries(buckets).map(([range, count]) => ({ range, count }))

  const top10Complexity = [...predictions]
    .sort((a, b) => b.avg_complexity - a.avg_complexity)
    .slice(0, 10)
    .map(p => ({ name: p.file_path.split('/').pop(), complexity: +p.avg_complexity.toFixed(1), risk: p.risk_level }))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      <Card title="Language Distribution" desc="Bytes of code per language">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie data={langData} dataKey="bytes" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={36}
              labelLine={false} label={<PieLabel/>}>
              {langData.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]}/>)}
            </Pie>
            <Tooltip formatter={v => `${(v / 1024).toFixed(1)} KB`} contentStyle={TT}/>
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Risk Distribution" desc="Files by predicted risk level">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={riskData} barSize={52}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(232,98,42,0.04)' }}/>
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {riskData.map((e, i) => <Cell key={i} fill={RISK_COLORS[e.name] || '#1d4ed8'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="File Size Distribution" desc="Number of files by lines of code">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={locData} barSize={52}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="range" tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(232,98,42,0.04)' }}/>
            <Bar dataKey="count" fill="#1d4ed8" radius={[6, 6, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Top 10 Complex Files" desc="Highest average cyclomatic complexity">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={top10Complexity} layout="vertical" barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
            <XAxis type="number" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={TT} cursor={{ fill: 'rgba(232,98,42,0.04)' }}/>
            <Bar dataKey="complexity" radius={[0, 4, 4, 0]}>
              {top10Complexity.map((e, i) => <Cell key={i} fill={RISK_COLORS[e.risk] || '#1d4ed8'}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
