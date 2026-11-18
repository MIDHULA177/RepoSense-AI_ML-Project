import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const signup      = (name, email, password) => api.post('/auth/signup', { name, email, password }).then(r => r.data)
export const login       = (email, password)        => api.post('/auth/login',  { email, password }).then(r => r.data)
export const getMe       = ()                        => api.get('/auth/me').then(r => r.data)
export const analyzeRepo    = (url, github_token = '', changed_files = []) => api.post('/analyze', { url, github_token, changed_files }).then(r => r.data)
export const searchRepos    = (q, language = '', page = 1, token = '')       => api.get('/github/search', { params: { q, language, sort: 'stars', page, per_page: 12, token } }).then(r => r.data)
export const getReadme      = (owner, repo)                                   => api.get('/github/readme', { params: { owner, repo } }).then(r => r.data)
export const trendingRepos  = (language = '')                                 => api.get('/github/trending', { params: { language } }).then(r => r.data)
export const getHistory  = ()                        => api.get('/history').then(r => r.data)
export const getAnalysis = (id)                      => api.get(`/history/${id}`).then(r => r.data)
export const deleteAnalysis = (id)                   => api.delete(`/history/${id}`).then(r => r.data)

export default api
