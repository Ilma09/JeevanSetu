import React, { useEffect, useState } from 'react'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { apiRequest } from '../lib/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const empty = { slug:'', name:'', authority:'', category:'', summary:'', benefits:'', eligibility:'', documents:'', officialUrl:'', sourceUrl:'', sourceName:'' }

export default function AdminSchemes() {
  const { user } = useAuth()
  const [schemes,setSchemes] = useState([])
  const [form,setForm] = useState(empty)
  const [message,setMessage] = useState('')
  const [error,setError] = useState('')
  async function load() { try { const data=await apiRequest('/schemes'); setSchemes(data.schemes) } catch(e) { setError(e.message) } }
  useEffect(()=>{ if(user?.role==='ADMIN') load() },[user])
  async function create(e) {
    e.preventDefault(); setError(''); setMessage('')
    try {
      const payload={...form,eligibility:form.eligibility.split('\n').map(x=>x.trim()).filter(Boolean),documents:form.documents.split('\n').map(x=>x.trim()).filter(Boolean)}
      await apiRequest('/schemes',{method:'POST',body:JSON.stringify(payload)})
      setForm(empty); setMessage('Scheme added as unverified. Review its official source, then verify it.'); load()
    } catch(err) { setError(err.message) }
  }
  async function verify(id) { try { await apiRequest(`/schemes/${id}/verify`,{method:'POST',body:JSON.stringify({})}); setMessage('Scheme marked verified.'); load() } catch(e) { setError(e.message) } }
  if(!user) return <div className="card p-6 text-sm">Sign in with an administrator account to continue.</div>
  if(user.role!=='ADMIN') return <div className="card p-6 text-sm">Administrator access is required.</div>
  return <div className="mx-auto max-w-5xl"><SectionHeader title="Scheme administration" subtitle="Add records and review source links before marking a scheme verified." />
    {message && <p className="mb-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{message}</p>}{error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={create} className="card mb-6 grid gap-3 p-5 sm:grid-cols-2">
      {['slug','name','authority','category','summary','benefits','officialUrl','sourceUrl','sourceName'].map(key=><label key={key} className="text-xs font-medium capitalize text-ink/65">{key}<input required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-2.5 text-sm" /></label>)}
      <label className="text-xs font-medium text-ink/65">Eligibility (one per line)<textarea required value={form.eligibility} onChange={e=>setForm({...form,eligibility:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-2.5 text-sm" rows="4" /></label>
      <label className="text-xs font-medium text-ink/65">Documents (one per line)<textarea required value={form.documents} onChange={e=>setForm({...form,documents:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-2.5 text-sm" rows="4" /></label>
      <button className="btn-accent sm:col-span-2">Add scheme for review</button>
    </form>
    <div className="space-y-3">{schemes.map(s=><div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-ink/50">{s.sourceName} · {s.isVerified?'Verified':'Needs verification'}</p><a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-teal-700 underline">Review official source</a></div>{!s.isVerified && <button onClick={()=>verify(s.id)} className="btn-secondary text-xs">Mark verified</button>}</div>)}</div>
  </div>
}
