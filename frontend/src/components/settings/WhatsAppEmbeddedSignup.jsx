import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, MessageCircle, Unplug, ExternalLink } from 'lucide-react';
import api from '../../services/api';

const META_APP_ID = import.meta.env.VITE_META_APP_ID;
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID;
const GRAPH_VERSION = import.meta.env.VITE_META_GRAPH_API_VERSION || 'v23.0';

export default function WhatsAppEmbeddedSignup() {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const authCodeRef = useRef('');
  const signupResultRef = useRef(null);

  const loadConnection = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.request('/whatsapp/connection');
      setConnection(result.connection || null);
      setError('');
    } catch (e) { setError(e.message || 'Unable to load WhatsApp connection.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadConnection(); }, [loadConnection]);

  useEffect(() => {
    if (!META_APP_ID) return;
    if (window.FB) return;
    window.fbAsyncInit = () => window.FB.init({ appId: META_APP_ID, cookie: true, xfbml: false, version: GRAPH_VERSION });
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true; script.defer = true; script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
  }, []);

  const persistSignup = useCallback(async () => {
    const code = authCodeRef.current;
    const signup = signupResultRef.current;
    if (!code || !signup?.waba_id || !signup?.phone_number_id) return;
    try {
      const result = await api.request('/whatsapp/embedded-signup', {
        method: 'POST',
        body: JSON.stringify({ code, wabaId: signup.waba_id, phoneNumberId: signup.phone_number_id }),
      });
      setConnection(result.connection || null);
      setSuccess('WhatsApp Business connected successfully.');
      setError('');
    } catch (e) { setError(e.message || 'WhatsApp connection failed.'); }
    finally { setBusy(false); authCodeRef.current = ''; signupResultRef.current = null; }
  }, []);

  useEffect(() => {
    const onMessage = (event) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com'].includes(event.origin)) return;
      let data;
      try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch { return; }
      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;
      if (data.event === 'CANCEL') { setBusy(false); setError('Meta signup was cancelled.'); return; }
      if (data.event === 'FINISH') { signupResultRef.current = data.data || {}; void persistSignup(); }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [persistSignup]);

  const connect = () => {
    setError(''); setSuccess('');
    if (!META_APP_ID || !META_CONFIG_ID) { setError('Set VITE_META_APP_ID and VITE_META_CONFIG_ID in frontend .env.'); return; }
    if (!window.FB) { setError('Meta SDK is loading. Please try again in a moment.'); return; }
    setBusy(true);
    window.FB.login((response) => {
      const code = response?.authResponse?.code;
      if (!code) { setBusy(false); setError('Meta authorization was cancelled or no authorization code was returned.'); return; }
      authCodeRef.current = code;
      // In some SDK flows the FINISH event precedes the OAuth callback; persist when both arrive.
      if (signupResultRef.current) void persistSignup();
    }, {
      config_id: META_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, sessionInfoVersion: '3' },
    });
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect this organization’s WhatsApp Business account?')) return;
    setBusy(true); setError(''); setSuccess('');
    try { await api.request('/whatsapp/connection', { method: 'DELETE' }); setConnection(null); setSuccess('WhatsApp disconnected.'); }
    catch (e) { setError(e.message || 'Unable to disconnect WhatsApp.'); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="card p-5 text-sm text-slate-500">Loading WhatsApp connection…</div>;
  return <section className="card space-y-4 p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100"><MessageCircle className="text-emerald-700" size={21}/></span><div><h3 className="text-lg font-semibold text-brand-900">WhatsApp Business</h3><p className="text-sm text-slate-500">Connect this organization’s Meta WhatsApp account.</p></div></div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${connection?.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{connection?.status === 'connected' ? 'Connected' : 'Not connected'}</span>
    </div>
    {error && <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16}/>{error}</p>}
    {success && <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 size={16}/>{success}</p>}
    {connection?.status === 'connected' ? <div className="space-y-3"><div className="rounded-lg bg-slate-50 p-4"><p className="font-medium text-slate-800">{connection.business_name || 'WhatsApp Business Account'}</p><p className="text-sm text-slate-500">{connection.display_phone_number || 'Phone number connected'}</p><p className="mt-1 text-xs text-slate-400">Phone Number ID: {connection.phone_number_id}</p></div><button disabled={busy} onClick={disconnect} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={16}/> : <Unplug size={16}/>}Disconnect</button></div> : <div><p className="text-sm leading-6 text-slate-600">Continue to Meta, select your Business Portfolio and WhatsApp number, and authorize the connection. Access credentials are stored securely on the backend.</p><button disabled={busy} onClick={connect} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={16}/> : <ExternalLink size={16}/>} {busy ? 'Connecting…' : 'Connect WhatsApp'}</button></div>}
  </section>;
}
