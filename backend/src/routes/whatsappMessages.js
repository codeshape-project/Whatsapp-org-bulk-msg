import { Router } from 'express';
import { sendTextMessage } from '../services/whatsappService.js';
const router = Router();
router.post('/send', async (req, res, next) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !String(text || '').trim()) return res.status(400).json({ error: 'Recipient phone and message text are required.' });
    const result = await sendTextMessage({ organizationId: req.organizationId, to, text: String(text).trim() });
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});
export default router;
