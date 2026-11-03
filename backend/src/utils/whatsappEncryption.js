import crypto from 'node:crypto';
import { config } from '../config.js';

function key() {
  const raw = config.whatsappEncryptionKey;
  if (!raw || !/^[a-f0-9]{64}$/i.test(raw)) {
    throw new Error('WHATSAPP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(raw, 'hex');
}

export function encryptWhatsAppToken(value) {
  if (!value) throw new Error('Cannot encrypt an empty WhatsApp token.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptWhatsAppToken(value) {
  if (!value) throw new Error('WhatsApp access token is missing. Reconnect WhatsApp.');
  const [ivHex, tagHex, encryptedHex] = String(value).split(':');
  if (!ivHex || !tagHex || !encryptedHex) throw new Error('Stored WhatsApp token format is invalid.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()]).toString('utf8');
}
