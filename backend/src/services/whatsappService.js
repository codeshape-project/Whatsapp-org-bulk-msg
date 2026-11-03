import { supabase } from '../db.js';
import { config } from '../config.js';
import { decryptWhatsAppToken } from '../utils/whatsappEncryption.js';

export async function getWhatsAppConnection(organizationId) {
  if (!organizationId) throw new Error('Organization context is required to use WhatsApp.');
  const { data, error } = await supabase.from('organization_whatsapp_connections')
    .select('organization_id,waba_id,phone_number_id,access_token_encrypted,business_name,display_phone_number,status')
    .eq('organization_id', organizationId).maybeSingle();
  if (error) throw error;
  if (!data || data.status !== 'connected' || !data.access_token_encrypted) {
    const err = new Error('This organization has not connected WhatsApp Business. Connect it in Settings first.');
    err.status = 409;
    throw err;
  }
  return { ...data, accessToken: decryptWhatsAppToken(data.access_token_encrypted) };
}

async function requestMeta(url, token, options = {}) {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `WhatsApp API failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function sendTextMessage({ organizationId, to, text }) {
  const connection = await getWhatsAppConnection(organizationId);
  const url = `https://graph.facebook.com/${config.metaGraphVersion}/${connection.phone_number_id}/messages`;
  return requestMeta(url, connection.accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { body: text } }),
  });
}

export async function sendOrganizationTemplate({ organizationId, to, name, language = 'en_US', components = [] }) {
  const connection = await getWhatsAppConnection(organizationId);
  const url = `https://graph.facebook.com/${config.metaGraphVersion}/${connection.phone_number_id}/messages`;
  return requestMeta(url, connection.accessToken, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'template', template: { name, language: { code: language }, ...(components.length ? { components } : {}) } }),
  });
}
