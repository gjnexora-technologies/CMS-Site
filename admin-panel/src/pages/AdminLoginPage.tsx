import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, KeyRound, LockKeyhole, School } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

type LoginResponse = { success?: boolean; error?: string };

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!supabase || !isSupabaseConfigured) {
      setError('Admin sign-in is unavailable because Supabase is not configured.');
      return;
    }

    setSubmitting(true);
    let authenticated = false;
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        throw new Error(`Email/password verification failed: ${authError.message}`);
      }
      authenticated = true;

      const { data, error: functionError } = await supabase.functions.invoke<LoginResponse>('admin-login', {
        body: { access_code: accessCode },
      });
      if (functionError || !data?.success) {
        throw new Error(
          data?.error ||
          (functionError
            ? `Admin access-code verification failed: ${functionError.message}`
            : 'Admin access-code verification failed. Please try again.')
        );
      }

      sessionStorage.setItem('apg-admin-code-verified', 'true');
      const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/';
      navigate(target, { replace: true });
    } catch (cause) {
      sessionStorage.removeItem('apg-admin-code-verified');
      if (authenticated) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error('Unable to clear failed admin sign-in session:', signOutError);
      }
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><School className="h-6 w-6" /></div>
          <div><p className="text-sm font-bold text-slate-900">APG School</p><p className="text-xs font-medium text-slate-500">Website administration</p></div>
        </div>
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in with your email and password, then verify with the secret admin code.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <label className="block text-sm font-semibold text-slate-700">Email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Enter email" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Enter password" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Secret admin code
            <div className="relative mt-2"><KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input required type="password" autoComplete="one-time-code" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Enter secret code" />
            </div>
          </label>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
            <LockKeyhole className="h-4 w-4" />{submitting ? 'Signing in…' : 'Sign in'}{!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">Admin access only. Registration is unavailable.</p>
      </section>
    </main>
  );
}
