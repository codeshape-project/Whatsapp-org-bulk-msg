import { Router } from 'express';
import { supabase } from '../db.js';
import { config } from '../config.js';
import { requireOrganizationAdmin } from '../middleware/requireOrganizationAdmin.js';
import { encryptWhatsAppToken } from '../utils/whatsappEncryption.js';

const router = Router();
const graph = (path) => `https://graph.facebook.com/${config.metaGraphVersion}/${path}`;
async function metaJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `Meta API request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

router.get('/connection', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('organization_whatsapp_connections')
      .select('id, organization_id, waba_id, phone_number_id, business_name, display_phone_number, status, last_error, connected_at, verified_at')
      .eq('organization_id', req.organizationId).maybeSingle();
    if (error) throw error;
    res.json({ connection: data || null });
  } catch (e) { next(e); }
});

router.post('/embedded-signup', requireOrganizationAdmin, async (req, res, next) => {
  try {
    const { code, wabaId, phoneNumberId } = req.body || {};
    if (!code || !wabaId || !phoneNumberId) {
      return res.status(400).json({ error: 'Meta authorization code, WABA ID, and phone number ID are required.' });
    }
    if (!config.metaAppId || !config.metaAppSecret) {
      return res.status(503).json({ error: 'Meta App ID and App Secret must be configured on the backend.' });
    }

    const exchange = new URL(graph('oauth/access_token'));
    exchange.searchParams.set('client_id', config.metaAppId);
    exchange.searchParams.set('client_secret', config.metaAppSecret);
    exchange.searchParams.set('code', code);
    const tokenData = await metaJson(exchange.toString());
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error('Meta did not return an access token.');

    const waba = await metaJson(`${graph(encodeURIComponent(wabaId))}?fields=id,name`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const phone = await metaJson(`${graph(`${encodeURIComponent(wabaId)}/phone_numbers`)}?fields=id,display_phone_number,verified_name`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const selectedPhone = (phone.data || []).find(item => String(item.id) === String(phoneNumberId));
    if (!selectedPhone) throw new Error('Selected phone number was not found under the authorized WhatsApp Business Account.');

    await metaJson(graph(`${encodeURIComponent(wabaId)}/subscribed_apps`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const encrypted = encryptWhatsAppToken(accessToken);
    const row = {
      organization_id: req.organizationId,
      waba_id: String(wabaId),
      phone_number_id: String(phoneNumberId),
      access_token_encrypted: encrypted,
      business_name: waba.name || selectedPhone.verified_name || null,
      display_phone_number: selectedPhone.display_phone_number || null,
      status: 'connected',
      last_error: null,
      connected_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('organization_whatsapp_connections')
      .upsert(row, { onConflict: 'organization_id' })
      .select('id, organization_id, waba_id, phone_number_id, business_name, display_phone_number, status, connected_at, verified_at')
      .single();
    if (error) throw error;
    res.json({ success: true, connection: data });
  } catch (e) { next(e); }
});

router.delete('/connection', requireOrganizationAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('organization_whatsapp_connections')
      .update({ status: 'disconnected', access_token_encrypted: '', last_error: null, updated_at: new Date().toISOString() })
      .eq('organization_id', req.organizationId);
    if (error) throw error;
    res.json({ success: true });
  } catch (e) { next(e); }
});

export default router;
