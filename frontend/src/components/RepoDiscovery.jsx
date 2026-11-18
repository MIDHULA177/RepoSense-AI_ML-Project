import { useState, useEffect } from 'react'
import { Search, Star, GitFork, AlertCircle, ExternalLink, Zap, TrendingUp, Loader } from 'lucide-react'
import { searchRepos, trendingRepos } from '../api/client'

const LANGUAGES = ['', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby', 'PHP']
const LANG_COLORS = { Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#2b7489', Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d', Ruby: '#701516', PHP: '#4F5D95' }

function RepoCard({ repo, onAnalyze }) {
  const [hovered, setHovered] = useState(false)
  const langColor = LANG_COLORS[repo.language] || 'var(--muted)'

  return (
    <div className="card card-hover" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'default', background: hovered ? 'var(--bg2)' : 'var(--card)' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{repo.owner}</span>
            <span style={{ color: 'var(--border2)' }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{repo.name}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {repo.description || 'No description provided.'}
          </p>
        </div>
        <a href={repo.url} target="_blank" rel="noreferrer"
          style={{ color: 'var(--muted)', flexShrink: 0, display: 'flex', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
          <ExternalLink size={13}/>
        </a>
      </div>

      {/* Topics */}
      {repo.topics?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {repo.topics.slice(0, 4).map(t => (
            <span key={t} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(37,99,235,0.08)', color: 'var(--blue)', border: '1px solid rgba(37,99,235,0.18)', fontWeight: 700 }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            <Star size={11} style={{ color: '#d97706' }}/>{repo.stars.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            <GitFork size={11}/>{repo.forks.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            <AlertCircle size={11}/>{repo.open_issues}
          </span>
          {repo.language && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor }}/>{repo.language}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onAnalyze(repo.url)} className="btn-primary"
            style={{ padding: '6px 14px', fontSize: 12, borderRadius: 7, gap: 5 }}>
            <Zap size={11}/> Analyze
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RepoDiscovery({ onAnalyze }) {
  const [query, setQuery]       = useState('')
  const [language, setLanguage] = useState('')
  const [repos, setRepos]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [mode, setMode]         = useState('trending') // 'trending' | 'search'
  const [error, setError]       = useState('')

  useEffect(() => { loadTrending() }, [])

  async function loadTrending(lang = '') {
    setLoading(true); setError('')
    try {
      const data = await trendingRepos(lang)
      setRepos(data.repos); setTotal(data.repos.length); setMode('trending')
    } catch { setError('Failed to load trending repos.') }
    finally { setLoading(false) }
  }

  async function handleSearch(p = 1) {
    if (!query.trim()) return loadTrending(language)
    setLoading(true); setError('')
    try {
      const data = await searchRepos(query, language, p)
      setRepos(data.repos); setTotal(data.total); setPage(p); setMode('search')
    } catch { setError('Search failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Search bar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234,108,10,0.1)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
            <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }}/>
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch(1)}
              placeholder="Search repositories by name, keyword, or topic…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit' }}/>
          </div>
          <select value={language} onChange={e => { setLanguage(e.target.value); if (!query) loadTrending(e.target.value) }}
            style={{ padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l || 'All Languages'}</option>)}
          </select>
          <button onClick={() => handleSearch(1)} className="btn-primary" style={{ borderRadius: 9, padding: '10px 20px' }}>
            <Search size={13}/> Search
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'trending'
            ? <><TrendingUp size={14} style={{ color: 'var(--accent)' }}/><span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Trending Repositories</span></>
            : <><Search size={14} style={{ color: 'var(--accent)' }}/><span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>Search Results</span></>
          }
          {!loading && <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>({total} repos)</span>}
        </div>
        {mode === 'search' && (
          <button onClick={() => { setQuery(''); loadTrending(language) }}
            style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}>
            Back to Trending
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 9, background: 'rgba(220,38,38,0.06)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.18)', fontSize: 13, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
          <Loader size={18} style={{ color: 'var(--accent)', animation: 'spin 0.8s linear infinite' }}/>
          <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 600 }}>Loading repositories…</span>
        </div>
      )}

      {/* Grid */}
      {!loading && repos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {repos.map((repo, i) => <RepoCard key={i} repo={repo} onAnalyze={onAnalyze}/>)}
        </div>
      )}

      {/* Pagination */}
      {!loading && mode === 'search' && total > 12 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 8 }}>
          <button onClick={() => handleSearch(page - 1)} disabled={page === 1} className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>← Prev</button>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>Page {page}</span>
          <button onClick={() => handleSearch(page + 1)} disabled={repos.length < 12} className="btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>Next →</button>
        </div>
      )}

      {!loading && repos.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 14 }}>No repositories found.</div>
      )}
    </div>
  )
}
