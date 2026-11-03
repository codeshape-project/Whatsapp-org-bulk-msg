export function requireOrganizationAdmin(req, res, next) {
  if (!req.organizationId || !req.membership) {
    return res.status(400).json({ error: 'Organization context is required.' });
  }
  if (!['owner', 'admin'].includes(String(req.membership.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Organization admin permission is required.' });
  }
  return next();
}
