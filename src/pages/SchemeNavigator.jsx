import React, { useEffect, useMemo, useState } from 'react'
import { Landmark, FileCheck2, ChevronDown, ExternalLink, Bookmark, ClipboardList, Search, ShieldCheck } from 'lucide-react'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SchemeNavigator() {
  const { user } = useAuth()
  const [schemes, setSchemes] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All categories')
  const [openId, setOpenId] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadSchemes() {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ verified: 'true' })
      if (query.trim()) params.set('q', query.trim())
      if (category !== 'All categories') params.set('category', category)
      const data = await apiRequest(`/schemes?${params.toString()}`)
      setSchemes(data.schemes)
      if (!openId && data.schemes[0]) setOpenId(data.schemes[0].id)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadSchemes() }, [query, category])
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return }
    apiRequest('/schemes/user/saved')
      .then(({ schemes: saved }) => setSavedIds(new Set(saved.map(s => s.id))))
      .catch(() => {})
  }, [user])

  const categories = useMemo(() => ['All categories', ...new Set(schemes.map(s => s.category))], [schemes])

  async function toggleSaved(scheme) {
    if (!user) { setNotice('Please sign in to save schemes.'); return }
    try {
      if (savedIds.has(scheme.id)) {
        await apiRequest(`/schemes/${scheme.id}/save`, { method: 'DELETE' })
        setSavedIds(prev => { const next = new Set(prev); next.delete(scheme.id); return next })
        setNotice('Removed from saved schemes.')
      } else {
        await apiRequest(`/schemes/${scheme.id}/save`, { method: 'POST' })
        setSavedIds(prev => new Set(prev).add(scheme.id))
        setNotice('Scheme saved to your account.')
      }
    } catch (err) { setNotice(err.message) }
  }

  async function startApplication(scheme) {
    if (!user) { setNotice('Please sign in before creating an application tracker.'); return }
    try {
      const { application } = await apiRequest(`/schemes/${scheme.id}/applications`, { method: 'POST', body: JSON.stringify({}) })
      setNotice(`Application tracker created: ${application.id}. This does not submit an application to the government.`)
    } catch (err) { setNotice(err.message) }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <SectionHeader title="Government Scheme Navigator" subtitle="Search verified scheme information and continue to the official government application portal." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 rounded-xl border border-teal-100 bg-white px-3 py-2.5">
          <Search size={17} className="text-ink/40" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search schemes or departments" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-teal-100 bg-white px-3 py-2.5 text-sm text-ink">
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
      </div>

      {notice && <div role="status" className="mb-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{notice}</div>}
      {error && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error} — Start the API and database, then refresh.</div>}
      {loading ? <p className="py-10 text-center text-sm text-ink/50">Loading verified schemes…</p> :
        schemes.length === 0 ? <div className="card p-8 text-center text-sm text-ink/55">No verified schemes match this search.</div> :
        <div className="space-y-3">
          {schemes.map(s => {
            const open = openId === s.id
            const eligibility = Array.isArray(s.eligibility) ? s.eligibility : []
            const documents = Array.isArray(s.documents) ? s.documents : []
            return <div key={s.id} className="card overflow-hidden">
              <button onClick={() => setOpenId(open ? null : s.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                <div className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-saffron-50 text-saffron-600"><Landmark size={18} /></span>
                  <div>
                    <p className="font-display text-base font-bold text-ink">{s.name}</p>
                    <p className="text-xs text-ink/45">{s.authority} · {s.category}</p>
                    <p className="mt-1.5 text-sm text-ink/65">{s.benefits}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700"><ShieldCheck size={12} /> Official source recorded · verified {new Date(s.verifiedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`shrink-0 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && <div className="border-t border-teal-50 bg-teal-50/30 px-5 py-4">
                <p className="mb-3 text-sm text-ink/70">{s.summary}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Eligibility criteria</p>
                    <ul className="mt-2 space-y-1.5">{eligibility.map((e, i) => <li key={i} className="flex items-start gap-2 text-sm text-ink/70"><FileCheck2 size={14} className="mt-0.5 shrink-0 text-teal-500" />{e}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">Documents / information to prepare</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">{documents.map((d, i) => <li key={i} className="chip">{d}</li>)}</ul>
                    <p className="mt-3 text-xs text-ink/50">Eligibility is decided by the government scheme authority. JeevanSetu does not certify eligibility.</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => toggleSaved(s)} className="btn-secondary text-xs"><Bookmark size={13} /> {savedIds.has(s.id) ? 'Unsave scheme' : 'Save scheme'}</button>
                  <button onClick={() => startApplication(s)} className="btn-accent text-xs"><ClipboardList size={13} /> Create application tracker</button>
                  <a href={s.officialUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs"><ExternalLink size={13} /> Apply / verify officially</a>
                </div>
                <p className="mt-3 text-[11px] text-ink/45">Source: <a className="underline" href={s.sourceUrl} target="_blank" rel="noreferrer">{s.sourceName}</a></p>
              </div>}
            </div>
          })}
        </div>}
    </div>
  )
}
