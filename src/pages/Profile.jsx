import React, { useEffect, useState } from 'react'
import { ShieldCheck, Landmark, Bell, Mic, Globe, LogOut, Phone, Mail, MapPin, UserRound } from 'lucide-react'
import SectionHeader from '../components/common/SectionHeader.jsx'
import { useApp, LANGUAGES } from '../context/AppContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { language, setLanguage, voiceMode, setVoiceMode } = useApp()
  const { user, logout, loading } = useAuth()
  const [smsAlerts, setSmsAlerts] = useState(false)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [saved, setSaved] = useState([])
  const [applications, setApplications] = useState([])

  useEffect(() => {
    if (!user) return
    apiRequest('/schemes/user/saved').then(({ schemes }) => setSaved(schemes)).catch(() => {})
    apiRequest('/schemes/user/applications').then(({ applications: rows }) => setApplications(rows)).catch(() => {})
  }, [user])

  if (loading) return <div className="mx-auto max-w-4xl py-10 text-center text-sm text-ink/50">Loading account…</div>
  if (!user) return <div className="mx-auto max-w-4xl"><SectionHeader title="Profile" subtitle="Sign in to view and manage your account." /><div className="card p-6"><Link to="/login" className="btn-accent">Sign in / Register</Link></div></div>

  return (
    <div className="mx-auto max-w-4xl">
      <SectionHeader title="Profile" subtitle="Your JeevanSetu account details" />
      <div className="card overflow-hidden">
        <div className="bg-indigo-500 px-6 py-8 text-white">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/15 font-display text-xl font-bold">{user.name?.split(' ').map(part => part[0]).slice(0,2).join('').toUpperCase()}</span>
            <div><p className="font-display text-xl font-bold">{user.name}</p><p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70"><ShieldCheck size={13} /> {user.role === 'ADMIN' ? 'Administrator' : 'Registered user'}</p></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
          <InfoRow icon={MapPin} label="Location" value={[user.district, user.state].filter(Boolean).join(', ') || 'Not provided'} />
          <InfoRow icon={UserRound} label="Account" value={`Created ${new Date(user.createdAt).toLocaleDateString('en-IN')}`} />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5"><p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink"><Landmark size={16} className="text-saffron-600" /> Saved schemes ({saved.length})</p>{saved.length ? saved.map(s => <p key={s.id} className="border-b border-teal-50 py-2 text-sm">{s.name}</p>) : <p className="text-xs text-ink/45">No saved schemes yet.</p>}</div>
        <div className="card p-5"><p className="mb-3 text-sm font-semibold text-ink">Application trackers ({applications.length})</p>{applications.length ? applications.map(a => <div key={a.id} className="border-b border-teal-50 py-2"><p className="text-sm">{a.scheme.name}</p><p className="text-xs text-ink/45">{a.status.replace('_',' ')} · {new Date(a.updatedAt).toLocaleDateString('en-IN')}</p></div>) : <p className="text-xs text-ink/45">No application trackers yet.</p>}</div>
      </div>
      <div className="mt-6 card divide-y divide-teal-50 p-2">
        <SettingRow icon={Globe} title="Preferred language" description="Used across the app and by the AI assistant" control={<select value={language} onChange={e => setLanguage(e.target.value)} className="rounded-lg border border-teal-100 bg-white px-2.5 py-1.5 text-xs font-medium text-ink/70">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.native}</option>)}</select>} />
        <SettingRow icon={Mic} title="Voice-first mode" description="Speak instead of type across the app" control={<Toggle checked={voiceMode} onChange={() => setVoiceMode(v => !v)} />} />
        <SettingRow icon={Bell} title="Push notifications" description="Local interface preference only" control={<Toggle checked={pushAlerts} onChange={() => setPushAlerts(v => !v)} />} />
        <SettingRow icon={Bell} title="SMS alerts" description="SMS delivery is not connected yet" control={<Toggle checked={smsAlerts} onChange={() => setSmsAlerts(v => !v)} />} />
      </div>
      <button onClick={logout} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100"><LogOut size={16} /> Sign out</button>
    </div>
  )
}
function InfoRow({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3 rounded-xl bg-teal-50/50 p-3.5"><Icon size={16} className="mt-0.5 shrink-0 text-teal-600" /><div className="min-w-0"><p className="text-[11px] text-ink/45">{label}</p><p className="break-words text-sm font-medium text-ink">{value}</p></div></div>
}
function SettingRow({ icon: Icon, title, description, control }) {
  return <div className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-600"><Icon size={16} /></span><div><p className="text-sm font-medium text-ink">{title}</p><p className="text-xs text-ink/45">{description}</p></div></div>{control}</div>
}
function Toggle({ checked, onChange }) {
  return <button onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-ink/15'}`} aria-pressed={checked}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
}
