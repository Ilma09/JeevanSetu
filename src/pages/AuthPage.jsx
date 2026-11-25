import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeader from '../components/common/SectionHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', state: '', district: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'login') await login({ email: form.email, password: form.password });
      else await register(form);
      navigate('/profile');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (user) return <div className="mx-auto max-w-xl card p-6"><p className="text-sm">You are signed in as {user.name}.</p><Link className="mt-3 inline-block text-sm font-semibold text-teal-700" to="/profile">Go to profile</Link></div>;

  return <div className="mx-auto max-w-xl">
    <SectionHeader title={mode === 'login' ? 'Welcome back' : 'Create your JeevanSetu account'} subtitle="Your account securely saves schemes and application tracking details." />
    <form onSubmit={submit} className="card space-y-4 p-6">
      {mode === 'register' && <label className="block text-sm">Full name<input required minLength="2" maxLength="80" value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /></label>}
      <label className="block text-sm">Email<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /></label>
      <label className="block text-sm">Password<input required type="password" minLength="10" value={form.password} onChange={e => setForm({...form, password:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /><span className="text-xs text-ink/45">At least 10 characters.</span></label>
      {mode === 'register' && <>
        <label className="block text-sm">Phone (optional)<input inputMode="numeric" pattern="[6-9][0-9]{9}" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">State<input value={form.state} onChange={e => setForm({...form,state:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /></label>
          <label className="block text-sm">District<input value={form.district} onChange={e => setForm({...form,district:e.target.value})} className="mt-1 w-full rounded-lg border border-teal-100 p-3" /></label>
        </div>
      </>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn-accent w-full justify-center disabled:opacity-60">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      <p className="text-center text-sm text-ink/55">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <button type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login'); setError('')}} className="font-semibold text-teal-700">{mode === 'login' ? 'Register' : 'Sign in'}</button></p>
    </form>
  </div>;
}
